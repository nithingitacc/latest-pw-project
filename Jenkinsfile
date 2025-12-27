pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'playwright-tests'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        /*
        ======================================================
        STEP 1: VERIFY DOCKER ACCESS (CRITICAL)
        ======================================================
        */
        stage('Docker Verify') {
            steps {
                bat '''
                echo ===== Docker Version =====
                docker --version

                echo ===== Docker Info =====
                docker info

                echo ===== Docker Hello World =====
                docker run hello-world
                '''
            }
        }

        /*
        ======================================================
        STEP 2: BUILD PLAYWRIGHT IMAGE
        ======================================================
        */
        stage('Docker Build Image') {
            steps {
                bat '''
                docker build -t %DOCKER_IMAGE% .
                '''
            }
        }

        /*
        ======================================================
        STEP 3: RUN TESTS INSIDE CONTAINER
        ======================================================
        */
        stage('Run Tests in Docker') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    bat '''
                    docker run --rm ^
                      -v "%cd%\\playwright-report:/app/playwright-report" ^
                      -v "%cd%\\test-results:/app/test-results" ^
                      %DOCKER_IMAGE%
                    '''
                }
            }
        }

        /*
        ======================================================
        STEP 4: PUBLISH RESULTS
        ======================================================
        */
        stage('Publish JUnit Report') {
            steps {
                junit 'test-results/results.xml'
            }
        }

        stage('Publish Report to Nginx') {
            steps {
                bat '''
                xcopy /E /I /Y playwright-report D:\\Devops\\nginx\\html\\playwright-report
                '''
            }
        }

        stage('Playwright Report URL') {
            steps {
                echo '================= Playwright HTML Report ================='
                echo '👉 http://localhost/playwright-report/index.html'
                echo '=========================================================='
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'playwright-report/**/*, test-results/**/*',
                             allowEmptyArchive: true
        }
    }
}
