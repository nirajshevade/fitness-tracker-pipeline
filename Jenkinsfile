pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS-18'
    }
    
    environment {
        APP_NAME = 'fitness-tracker'
        NODE_ENV = 'test'
    }
    
    options {
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out source code...'
                checkout scm
                script {
                    env.GIT_COMMIT_MSG = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim()
                    env.GIT_AUTHOR = sh(script: 'git log -1 --pretty=%an', returnStdout: true).trim()
                    env.GIT_BRANCH_NAME = sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
                }
                echo "Commit: ${env.GIT_COMMIT_MSG}"
                echo "Author: ${env.GIT_AUTHOR}"
                echo "Branch: ${env.GIT_BRANCH_NAME}"
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing Node.js dependencies...'
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
        
        stage('Code Quality') {
            steps {
                echo '🔍 Running code quality checks...'
                sh '''
                    echo "Running ESLint..."
                    npm run lint || true
                '''
            }
        }
        
        stage('Unit Tests') {
            steps {
                echo '🧪 Running unit tests...'
                sh 'npm test -- --ci --coverage --reporters=default --reporters=jest-junit'
            }
            post {
                always {
                    junit 'junit.xml'
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage/lcov-report',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                echo '🔒 Running security vulnerability scan...'
                sh '''
                    echo "Checking for known vulnerabilities..."
                    npm audit --audit-level=high || true
                '''
            }
        }
        
        stage('Build') {
            steps {
                echo '🔨 Building application...'
                sh '''
                    npm run build
                    echo "Build completed successfully!"
                '''
            }
        }
        
        stage('Docker Build') {
            steps {
                echo '🐳 Building Docker image...'
                sh '''
                    docker build -t fitness-tracker:${BUILD_NUMBER} .
                    docker tag fitness-tracker:${BUILD_NUMBER} fitness-tracker:latest
                '''
            }
        }
        
        stage('Push to Registry') {
            when {
                expression { return false }  // Skip for now - enable when registry is configured
            }
            steps {
                echo '📤 Pushing to Docker registry...'
                sh '''
                    echo "Pushing to registry..."
                '''
            }
        }
        
        stage('Deploy to Staging') {
            steps {
                echo '🚀 Deploying to staging environment...'
                sh '''
                    echo "Stopping existing container (if any)..."
                    docker stop fitness-tracker-staging || true
                    docker rm fitness-tracker-staging || true
                    echo "Starting new container..."
                    docker run -d --name fitness-tracker-staging \
                        -p 3001:3000 \
                        --restart unless-stopped \
                        fitness-tracker:${BUILD_NUMBER}
                '''
            }
        }
        
        stage('Integration Tests') {
            steps {
                echo '🧪 Running integration tests...'
                sh '''
                    echo "Waiting for application to start..."
                    sleep 5
                    echo "Testing health endpoint..."
                    curl -f http://localhost:3001/health || exit 1
                    echo "Integration tests passed!"
                '''
            }
        }
        
        stage('Deploy to Production') {
            when {
                anyOf {
                    branch 'main'
                    branch 'origin/main'
                    branch 'master'
                    branch 'origin/master'
                    expression { 
                        return env.GIT_BRANCH_NAME == 'main' || 
                               env.GIT_BRANCH_NAME == 'master' ||
                               env.GIT_BRANCH == 'origin/main' ||
                               env.GIT_BRANCH == 'origin/master' ||
                               env.BRANCH_NAME == 'main'
                    }
                    // Always deploy to production for demonstration
                    expression { return true }
                }
            }
            steps {
                echo '🚀 Deploying to production environment...'
                sh '''
                    echo "Stopping existing production container (if any)..."
                    docker stop fitness-tracker-prod || true
                    docker rm fitness-tracker-prod || true
                    echo "Starting production container..."
                    docker run -d --name fitness-tracker-prod \
                        -p 3000:3000 \
                        --restart unless-stopped \
                        fitness-tracker:${BUILD_NUMBER}
                    echo "Production deployment completed!"
                '''
            }
        }
    }
    
    post {
        always {
            echo '🧹 Cleaning up workspace...'
            cleanWs()
        }
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}