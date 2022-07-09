pipeline {
    agent {
        docker.image('node:14.20-alpine').withRun('-p 3000:3000')
    }
    
    options {
        ansiColor('xterm')
    }

    stages {
        stage('Checkout code') {
            steps {
                echo 'Source Code Management...'
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                echo "Building on: ${WORKSPACE}"
                echo 'Installing dependencies...'
                bat "cd ${WORKSPACE}"
                bat "npm install"
            }
        }

        stage('Run automated security tests') {
            steps {
                echo 'Running automated security tests...'
                bat "npm run cy:run"
            }
        }
    }
}