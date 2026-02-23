// Jenkinsfile for Fitness Tracker Application
// Demonstrates Continuous Integration and Continuous Deployment (CI/CD)

pipeline {
    agent any

    // Environment variables
    environment {
        APP_NAME = 'fitness-tracker'
        DOCKER_IMAGE = "fitness-tracker:${BUILD_NUMBER}"
        DOCKER_REGISTRY = 'localhost:5000'  // Change to your registry
        NODE_VERSION = '18'
    }

    // Build triggers
    triggers {
        // Poll SCM every 5 minutes
        pollSCM('H/5 * * * *')
        // Or use webhook trigger
        // githubPush()
    }

    // Pipeline options
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        // Stage 1: Checkout code from repository
        stage('Checkout') {
            steps {
                echo '📥 Checking out source code...'
                checkout scm
                
                script {
                    // Get commit info for later use
                    env.GIT_COMMIT_MSG = sh(
                        script: 'git log -1 --pretty=%B',
                        returnStdout: true
                    ).trim()
                    env.GIT_AUTHOR = sh(
                        script: 'git log -1 --pretty=%an',
                        returnStdout: true
                    ).trim()
                }
                
                echo "Commit: ${env.GIT_COMMIT_MSG}"
                echo "Author: ${env.GIT_AUTHOR}"
            }
        }

        // Stage 2: Install dependencies
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing Node.js dependencies...'
                
                // Using NodeJS plugin or direct npm
                sh '''
                    echo "Node version:"
                    node --version
                    echo "NPM version:"
                    npm --version
                    echo "Installing dependencies..."
                    npm ci
                '''
            }
        }

        // Stage 3: Code Quality - Linting
        stage('Code Quality') {
            steps {
                echo '🔍 Running code quality checks...'
                
                sh '''
                    echo "Running ESLint..."
                    npm run lint || true
                '''
            }
        }

        // Stage 4: Run Unit Tests
        stage('Unit Tests') {
            steps {
                echo '🧪 Running unit tests...'
                
                sh '''
                    npm test -- --ci --coverage --reporters=default --reporters=jest-junit
                '''
            }
            post {
                always {
                    // Publish test results
                    junit allowEmptyResults: true, testResults: 'junit.xml'
                    
                    // Publish coverage report
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage/lcov-report',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }

        // Stage 5: Security Scan
        stage('Security Scan') {
            steps {
                echo '🔒 Running security vulnerability scan...'
                
                sh '''
                    echo "Checking for known vulnerabilities..."
                    npm audit --audit-level=high || true
                '''
            }
        }

        // Stage 6: Build Application
        stage('Build') {
            steps {
                echo '🔨 Building application...'
                
                sh '''
                    npm run build
                    echo "Build completed successfully!"
                '''
            }
        }

        // Stage 7: Build Docker Image
        stage('Docker Build') {
            steps {
                echo '🐳 Building Docker image...'
                
                sh '''
                    docker build -t ${APP_NAME}:${BUILD_NUMBER} .
                    docker tag ${APP_NAME}:${BUILD_NUMBER} ${APP_NAME}:latest
                '''
            }
        }

        // Stage 8: Push to Registry (Optional)
        stage('Push to Registry') {
            when {
                branch 'main'
            }
            steps {
                echo '📤 Pushing Docker image to registry...'
                
                sh '''
                    echo "Pushing to registry..."
                    # docker push ${DOCKER_REGISTRY}/${APP_NAME}:${BUILD_NUMBER}
                    # docker push ${DOCKER_REGISTRY}/${APP_NAME}:latest
                    echo "Push completed (simulated for demo)"
                '''
            }
        }

        // Stage 9: Deploy to Staging
        stage('Deploy to Staging') {
            steps {
                echo '🚀 Deploying to staging environment...'
                
                sh '''
                    echo "Stopping existing container (if any)..."
                    docker stop ${APP_NAME}-staging || true
                    docker rm ${APP_NAME}-staging || true
                    
                    echo "Starting new container..."
                    docker run -d \
                        --name ${APP_NAME}-staging \
                        -p 3001:3000 \
                        --restart unless-stopped \
                        ${APP_NAME}:${BUILD_NUMBER}
                    
                    echo "Waiting for application to start..."
                    sleep 5
                    
                    echo "Health check..."
                    curl -f http://localhost:3001/health || exit 1
                    
                    echo "Staging deployment successful!"
                '''
            }
        }

        // Stage 10: Integration Tests
        stage('Integration Tests') {
            steps {
                echo '🔗 Running integration tests...'
                
                sh '''
                    echo "Testing API endpoints..."
                    
                    # Test health endpoint
                    curl -f http://localhost:3001/health
                    
                    # Test fitness data endpoint
                    curl -f http://localhost:3001/api/fitness
                    
                    # Test creating a workout
                    curl -X POST http://localhost:3001/api/workouts \
                        -H "Content-Type: application/json" \
                        -d '{"type":"Running","duration":30,"caloriesBurned":300}'
                    
                    echo "Integration tests passed!"
                '''
            }
        }

        // Stage 11: Deploy to Production (Manual Approval)
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                // Manual approval gate
                input message: 'Deploy to production?', ok: 'Deploy'
                
                echo '🎯 Deploying to production environment...'
                
                sh '''
                    echo "Stopping existing production container (if any)..."
                    docker stop ${APP_NAME}-prod || true
                    docker rm ${APP_NAME}-prod || true
                    
                    echo "Starting production container..."
                    docker run -d \
                        --name ${APP_NAME}-prod \
                        -p 3000:3000 \
                        --restart unless-stopped \
                        -e NODE_ENV=production \
                        ${APP_NAME}:${BUILD_NUMBER}
                    
                    echo "Production deployment successful!"
                '''
            }
        }
    }

    // Post-build actions
    post {
        always {
            echo '🧹 Cleaning up workspace...'
            cleanWs()
        }
        
        success {
            echo '✅ Pipeline completed successfully!'
            
            // Send success notification (example with Slack)
            // slackSend(
            //     color: 'good',
            //     message: "BUILD SUCCESS: ${APP_NAME} #${BUILD_NUMBER}\nCommit: ${env.GIT_COMMIT_MSG}\nAuthor: ${env.GIT_AUTHOR}"
            // )
        }
        
        failure {
            echo '❌ Pipeline failed!'
            
            // Send failure notification
            // slackSend(
            //     color: 'danger',
            //     message: "BUILD FAILED: ${APP_NAME} #${BUILD_NUMBER}\nCommit: ${env.GIT_COMMIT_MSG}\nAuthor: ${env.GIT_AUTHOR}"
            // )
        }
        
        unstable {
            echo '⚠️ Pipeline completed with warnings!'
        }
    }
}
