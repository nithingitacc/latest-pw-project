pipeline {

    // -------------------------------------------------------
    // Run on any available Jenkins agent (Windows in your case)
    // -------------------------------------------------------
    agent any

    // -------------------------------------------------------
    // Global environment variables
    // Used across all stages
    // -------------------------------------------------------
    environment {
        DOCKER_IMAGE = 'playwright-tests'
        BUILD_REPORT_DIR = "build-%BUILD_NUMBER%"
    }

    stages {

        // -------------------------------------------------------
        // STEP 0: Checkout source code from GitHub
        // -------------------------------------------------------
        stage('Checkout') {
            steps {
                // Pulls the latest code from the configured SCM
                checkout scm
            }
        }

        /*
        ======================================================
        STEP 1: VERIFY DOCKER ACCESS (CRITICAL FOUNDATION)
        ======================================================
        */
        stage('Docker Verify') {
            steps {
                bat '''
                echo ===== Docker Version =====
                docker --version

                echo ===== Docker System Info =====
                docker info

                echo ===== Docker Hello World Test =====
                docker run hello-world
                '''
            }
        }

        /*
        ======================================================
        STEP 2: BUILD PLAYWRIGHT DOCKER IMAGE
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
        STEP 3: RUN PLAYWRIGHT TESTS INSIDE DOCKER
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
        STEP 4: PUBLISH TEST RESULTS (CI VISIBILITY)
        ======================================================
        */
        stage('Publish JUnit Report') {
            steps {
                junit 'test-results/results.xml'
            }
        }

        /*
        ======================================================
        STEP 5: PUBLISH HTML REPORT VIA NGINX (BUILD-SAFE)
        ======================================================

        CHANGE MADE:
        - Each build gets its own folder
        - Old reports are preserved
        */
        stage('Publish Report to Nginx') {
            steps {
                bat '''
                mkdir D:\\Devops\\nginx\\html\\playwright-report\\%BUILD_REPORT_DIR%
                xcopy /E /I /Y playwright-report D:\\Devops\\nginx\\html\\playwright-report\\%BUILD_REPORT_DIR%
                '''
            }
        }

        /*
        ======================================================
        STEP 6: DISPLAY REPORT ACCESS URL
        ======================================================
        */
        stage('Playwright Report URL') {
            steps {
                echo '================= Playwright HTML Report ================='
                echo "👉 http://localhost/playwright-report/build-${env.BUILD_NUMBER}/index.html"
                echo '=========================================================='
            }
        }
    }

    /*
    ======================================================
    POST-BUILD ACTIONS (ALWAYS EXECUTE)
    ======================================================
    */
    post {
        always {
            archiveArtifacts artifacts: 'playwright-report/**/*, test-results/**/*',
                             allowEmptyArchive: true
        }
    }
}
