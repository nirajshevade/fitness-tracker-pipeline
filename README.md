# Fitness Tracker Application - CI/CD with Jenkins

## Experiment 4: Continuous Integration and Continuous Deployment

This project demonstrates CI/CD practices using Jenkins for a Fitness Tracker web application.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Application Features](#application-features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Local Development Setup](#local-development-setup)
7. [Jenkins CI/CD Pipeline](#jenkins-cicd-pipeline)
8. [Pipeline Stages Explained](#pipeline-stages-explained)
9. [Docker Deployment](#docker-deployment)
10. [API Documentation](#api-documentation)
11. [Screenshots](#screenshots)

---

## Project Overview

This experiment demonstrates the implementation of Continuous Integration (CI) and Continuous Deployment (CD) using Jenkins for a Fitness Tracker application. The application allows users to:

- Log daily workouts
- Track calories burned and steps
- Set fitness goals
- View workout history and statistics

---

## Application Features

- **Workout Logging**: Add workouts with type, duration, calories, and steps
- **Goal Setting**: Set daily steps, calories, and weekly workout goals
- **Statistics Dashboard**: View total workouts, calories burned, and steps
- **Progress Tracking**: Visual progress bar for weekly goals
- **Responsive Design**: Works on desktop and mobile devices

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js, Express.js |
| Testing | Jest, Supertest |
| CI/CD | Jenkins |
| Containerization | Docker |
| Version Control | Git |

---

## Project Structure

```
fitness-tracker/
├── public/
│   └── index.html          # Frontend application
├── server.js               # Express server and API
├── server.test.js          # Unit tests
├── package.json            # Node.js dependencies
├── Dockerfile              # Docker configuration
├── Jenkinsfile             # Jenkins pipeline definition
├── jest.config.js          # Jest test configuration
├── .eslintrc.json          # ESLint configuration
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

---

## Prerequisites

Before running this project, ensure you have:

1. **Node.js** (v18 or higher)
   ```bash
   node --version
   ```

2. **npm** (comes with Node.js)
   ```bash
   npm --version
   ```

3. **Docker** (for containerization)
   ```bash
   docker --version
   ```

4. **Jenkins** (for CI/CD)
   - Download from: https://www.jenkins.io/download/

5. **Git** (for version control)
   ```bash
   git --version
   ```

---

## Local Development Setup

### Step 1: Clone/Navigate to the project
```bash
cd Exp-4
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Run the application
```bash
npm start
```

### Step 4: Access the application
Open browser and navigate to: `http://localhost:3000`

### Step 5: Run tests
```bash
npm test
```

---

## Jenkins CI/CD Pipeline

### Jenkins Setup

1. **Install Jenkins**
   - Download and install from https://www.jenkins.io/download/
   - Start Jenkins service
   - Access at `http://localhost:8080`

2. **Install Required Plugins**
   - NodeJS Plugin
   - Docker Pipeline
   - Pipeline
   - Git
   - HTML Publisher (for coverage reports)

3. **Configure NodeJS in Jenkins**
   - Go to: Manage Jenkins → Global Tool Configuration
   - Add NodeJS installation (version 18.x)

4. **Create Pipeline Job**
   - Click "New Item"
   - Enter name: "fitness-tracker-pipeline"
   - Select "Pipeline"
   - In Pipeline section:
     - Definition: "Pipeline script from SCM"
     - SCM: Git
     - Repository URL: Your repository URL
     - Script Path: Jenkinsfile

### Triggering the Pipeline

The pipeline can be triggered by:
- **Manual**: Click "Build Now" in Jenkins
- **SCM Polling**: Automatically every 5 minutes (configured in Jenkinsfile)
- **Webhook**: Configure GitHub/GitLab webhook for instant triggers

---

## Pipeline Stages Explained

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CI/CD PIPELINE FLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐        │
│   │ Checkout │ → │ Install  │ → │  Code    │ → │   Unit   │        │
│   │   Code   │   │   Deps   │   │ Quality  │   │  Tests   │        │
│   └──────────┘   └──────────┘   └──────────┘   └──────────┘        │
│                                                       │              │
│                                                       ▼              │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐        │
│   │  Docker  │ ← │  Build   │ ← │ Security │ ← │  Stage   │        │
│   │  Build   │   │   App    │   │   Scan   │   │ Deploy   │        │
│   └──────────┘   └──────────┘   └──────────┘   └──────────┘        │
│        │                                                             │
│        ▼                                                             │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐                       │
│   │  Push    │ → │Integration│ → │   Prod   │                       │
│   │ Registry │   │  Tests   │   │  Deploy  │                       │
│   └──────────┘   └──────────┘   └──────────┘                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Stage Descriptions

| Stage | Description | CI/CD Type |
|-------|-------------|------------|
| **Checkout** | Clone source code from Git repository | CI |
| **Install Dependencies** | Install Node.js packages using npm | CI |
| **Code Quality** | Run ESLint for code style checks | CI |
| **Unit Tests** | Execute Jest unit tests with coverage | CI |
| **Security Scan** | Check for npm vulnerabilities | CI |
| **Build** | Build application artifacts | CI |
| **Docker Build** | Create Docker container image | CI/CD |
| **Push to Registry** | Push image to Docker registry | CD |
| **Deploy to Staging** | Deploy to staging environment | CD |
| **Integration Tests** | Test deployed application | CD |
| **Deploy to Production** | Deploy to production (manual approval) | CD |

---

## Docker Deployment

### Build Docker Image
```bash
docker build -t fitness-tracker:latest .
```

### Run Container
```bash
docker run -d -p 3000:3000 --name fitness-app fitness-tracker:latest
```

### Check Container Health
```bash
docker ps
curl http://localhost:3000/health
```

### Stop and Remove Container
```bash
docker stop fitness-app
docker rm fitness-app
```

---

## API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Serve frontend application |
| GET | `/health` | Health check endpoint |
| GET | `/api/fitness` | Get all fitness data |
| GET | `/api/workouts` | Get all workouts |
| POST | `/api/workouts` | Add new workout |
| DELETE | `/api/workouts/:id` | Delete a workout |
| GET | `/api/stats` | Get statistics |
| PUT | `/api/goals` | Update fitness goals |

### Example API Calls

**Add Workout:**
```bash
curl -X POST http://localhost:3000/api/workouts \
  -H "Content-Type: application/json" \
  -d '{"type":"Running","duration":30,"caloriesBurned":300,"steps":5000}'
```

**Get Statistics:**
```bash
curl http://localhost:3000/api/stats
```

**Update Goals:**
```bash
curl -X PUT http://localhost:3000/api/goals \
  -H "Content-Type: application/json" \
  -d '{"dailySteps":12000,"dailyCalories":600,"weeklyWorkouts":6}'
```

---

## Screenshots

### Application Interface
The Fitness Tracker features:
- Statistics dashboard with workout count, calories, and steps
- Workout logging form
- Goals setting panel
- Workout history list

### Jenkins Pipeline
The pipeline shows:
- Sequential stage execution
- Test results and coverage reports
- Build success/failure status
- Deployment status

---

## CI/CD Benefits Demonstrated

1. **Automated Testing**: Every code change is automatically tested
2. **Code Quality Checks**: Consistent code style enforced
3. **Security Scanning**: Vulnerabilities detected early
4. **Containerization**: Consistent deployment across environments
5. **Staging Environment**: Changes tested before production
6. **Manual Approval Gate**: Human oversight for production deployments
7. **Automated Notifications**: Team informed of build status

---

## Conclusion

This experiment successfully demonstrates the implementation of a CI/CD pipeline using Jenkins for a Node.js fitness tracker application. The pipeline automates:

- Code checkout and dependency installation
- Code quality and security checks
- Unit and integration testing
- Docker image building
- Staging and production deployments

The implementation showcases DevOps best practices including:
- Infrastructure as Code (Jenkinsfile, Dockerfile)
- Automated testing
- Containerization
- Multi-environment deployment
- Manual approval gates for production

---

## Author

DevOps Lab - Experiment 4
Continuous Integration and Continuous Deployment using Jenkins.

---

## License

This project is for educational purposes.
