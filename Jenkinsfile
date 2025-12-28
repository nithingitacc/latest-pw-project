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
        NGINX_ROOT   = 'D:\\Devops\\nginx\\html\\playwright-report'
        BUILD_DIR   = "build-${env.BUILD_NUMBER}"
    }

    stages {

        // -------------------------------------------------------
        // STEP 0: Checkout source code from GitHub
        // -------------------------------------------------------
        stage('Checkout') {
            steps {
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

                echo ===== Docker Info =====
                docker info

                echo ===== Docker Sanity Test =====
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
                      --user root ^
                      -v "%cd%\\playwright-report:/app/playwright-report" ^
                      -v "%cd%\\test-results:/app/test-results" ^
                      %DOCKER_IMAGE%
                    '''
                }
            }
        }

        /*
        ======================================================
        STEP 4: PUBLISH JUNIT RESULTS TO JENKINS
        ======================================================
        */
        stage('Publish JUnit Report') {
            steps {
                junit 'test-results/results.xml'
            }
        }

        /*
        ======================================================
        STEP 5: PUBLISH HTML REPORT TO NGINX (BUILD-WISE)
        ======================================================

        PURPOSE:
        - Prevent report overwrite
        - Preserve build history
        - Enable audit & rollback
        */
        stage('Publish Report to Nginx') {
            steps {
                bat """
                echo ===== Creating build-specific folder =====
                mkdir "%NGINX_ROOT%\\%BUILD_DIR%"

                echo ===== Copying Playwright report =====
                xcopy /E /I /Y playwright-report "%NGINX_ROOT%\\%BUILD_DIR%"
                """
            }
        }

        /*
        ======================================================
        STEP 6: DISPLAY REPORT URL
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
