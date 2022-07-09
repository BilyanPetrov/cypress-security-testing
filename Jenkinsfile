pipeline {
    agent any

    stages {
        stage('Checkout code') {
            steps {
                echo 'Source Code Management...'
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                echo 'Installing dependencies...'
                bat "cd ${WORKSPACE}/cypress-automated-security"
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