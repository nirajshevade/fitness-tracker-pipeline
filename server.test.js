const request = require('supertest');
const app = require('./server');

describe('Fitness Tracker API Tests', () => {
    
    describe('Health Check', () => {
        test('GET /health should return healthy status', async () => {
            const response = await request(app).get('/health');
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('healthy');
            expect(response.body).toHaveProperty('timestamp');
        });
    });

    describe('Fitness Data Endpoints', () => {
        test('GET /api/fitness should return fitness data', async () => {
            const response = await request(app).get('/api/fitness');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('workouts');
            expect(response.body).toHaveProperty('goals');
            expect(response.body).toHaveProperty('stats');
        });

        test('GET /api/stats should return statistics', async () => {
            const response = await request(app).get('/api/stats');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('totalWorkouts');
            expect(response.body).toHaveProperty('totalCaloriesBurned');
            expect(response.body).toHaveProperty('totalSteps');
        });
    });

    describe('Workout Endpoints', () => {
        let workoutId;

        test('POST /api/workouts should create a new workout', async () => {
            const workout = {
                type: 'Running',
                duration: 30,
                caloriesBurned: 300,
                steps: 5000
            };

            const response = await request(app)
                .post('/api/workouts')
                .send(workout);

            expect(response.status).toBe(201);
            expect(response.body.type).toBe('Running');
            expect(response.body.duration).toBe(30);
            expect(response.body.caloriesBurned).toBe(300);
            expect(response.body.steps).toBe(5000);
            expect(response.body).toHaveProperty('id');
            
            workoutId = response.body.id;
        });

        test('POST /api/workouts should return 400 if type is missing', async () => {
            const workout = {
                duration: 30
            };

            const response = await request(app)
                .post('/api/workouts')
                .send(workout);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Type and duration are required');
        });

        test('POST /api/workouts should return 400 if duration is missing', async () => {
            const workout = {
                type: 'Running'
            };

            const response = await request(app)
                .post('/api/workouts')
                .send(workout);

            expect(response.status).toBe(400);
        });

        test('GET /api/workouts should return all workouts', async () => {
            const response = await request(app).get('/api/workouts');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        test('DELETE /api/workouts/:id should delete a workout', async () => {
            // First create a workout
            const createResponse = await request(app)
                .post('/api/workouts')
                .send({ type: 'Cycling', duration: 45, caloriesBurned: 400 });
            
            const newWorkoutId = createResponse.body.id;

            // Then delete it
            const deleteResponse = await request(app)
                .delete(`/api/workouts/${newWorkoutId}`);

            expect(deleteResponse.status).toBe(200);
            expect(deleteResponse.body.message).toBe('Workout deleted successfully');
        });

        test('DELETE /api/workouts/:id should return 404 for non-existent workout', async () => {
            const response = await request(app)
                .delete('/api/workouts/999999');

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Workout not found');
        });
    });

    describe('Goals Endpoints', () => {
        test('PUT /api/goals should update goals', async () => {
            const goals = {
                dailySteps: 12000,
                dailyCalories: 600,
                weeklyWorkouts: 6
            };

            const response = await request(app)
                .put('/api/goals')
                .send(goals);

            expect(response.status).toBe(200);
            expect(response.body.dailySteps).toBe(12000);
            expect(response.body.dailyCalories).toBe(600);
            expect(response.body.weeklyWorkouts).toBe(6);
        });

        test('PUT /api/goals should update partial goals', async () => {
            const goals = {
                dailySteps: 15000
            };

            const response = await request(app)
                .put('/api/goals')
                .send(goals);

            expect(response.status).toBe(200);
            expect(response.body.dailySteps).toBe(15000);
        });
    });
});

describe('Input Validation', () => {
    test('Workout duration should be converted to integer', async () => {
        const workout = {
            type: 'Yoga',
            duration: '60',
            caloriesBurned: '200'
        };

        const response = await request(app)
            .post('/api/workouts')
            .send(workout);

        expect(response.status).toBe(201);
        expect(typeof response.body.duration).toBe('number');
        expect(response.body.duration).toBe(60);
    });

    test('Missing optional fields should default to 0', async () => {
        const workout = {
            type: 'Swimming',
            duration: 45
        };

        const response = await request(app)
            .post('/api/workouts')
            .send(workout);

        expect(response.status).toBe(201);
        expect(response.body.caloriesBurned).toBe(0);
        expect(response.body.steps).toBe(0);
    });
});
