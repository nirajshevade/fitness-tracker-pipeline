const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory storage for fitness data
let fitnessData = {
    workouts: [],
    goals: {
        dailySteps: 10000,
        dailyCalories: 500,
        weeklyWorkouts: 5
    },
    stats: {
        totalWorkouts: 0,
        totalCaloriesBurned: 0,
        totalSteps: 0
    }
};

// API Routes

// Get all fitness data
app.get('/api/fitness', (req, res) => {
    res.json(fitnessData);
});

// Add a new workout
app.post('/api/workouts', (req, res) => {
    const { type, duration, caloriesBurned, steps, date } = req.body;
    
    if (!type || !duration) {
        return res.status(400).json({ error: 'Type and duration are required' });
    }

    const workout = {
        id: Date.now(),
        type,
        duration: parseInt(duration),
        caloriesBurned: parseInt(caloriesBurned) || 0,
        steps: parseInt(steps) || 0,
        date: date || new Date().toISOString().split('T')[0]
    };

    fitnessData.workouts.push(workout);
    fitnessData.stats.totalWorkouts++;
    fitnessData.stats.totalCaloriesBurned += workout.caloriesBurned;
    fitnessData.stats.totalSteps += workout.steps;

    res.status(201).json(workout);
});

// Get all workouts
app.get('/api/workouts', (req, res) => {
    res.json(fitnessData.workouts);
});

// Delete a workout
app.delete('/api/workouts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const workoutIndex = fitnessData.workouts.findIndex(w => w.id === id);
    
    if (workoutIndex === -1) {
        return res.status(404).json({ error: 'Workout not found' });
    }

    const workout = fitnessData.workouts[workoutIndex];
    fitnessData.stats.totalWorkouts--;
    fitnessData.stats.totalCaloriesBurned -= workout.caloriesBurned;
    fitnessData.stats.totalSteps -= workout.steps;
    
    fitnessData.workouts.splice(workoutIndex, 1);
    res.json({ message: 'Workout deleted successfully' });
});

// Update goals
app.put('/api/goals', (req, res) => {
    const { dailySteps, dailyCalories, weeklyWorkouts } = req.body;
    
    if (dailySteps) fitnessData.goals.dailySteps = parseInt(dailySteps);
    if (dailyCalories) fitnessData.goals.dailyCalories = parseInt(dailyCalories);
    if (weeklyWorkouts) fitnessData.goals.weeklyWorkouts = parseInt(weeklyWorkouts);

    res.json(fitnessData.goals);
});

// Get statistics
app.get('/api/stats', (req, res) => {
    res.json(fitnessData.stats);
});

// Health check endpoint for CI/CD
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Fitness Tracker server running on port ${PORT}`);
        console.log(`Access the app at http://localhost:${PORT}`);
    });
}

module.exports = app;
