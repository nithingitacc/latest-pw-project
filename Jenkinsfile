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

        PURPOSE:
        - Ensure Jenkins can talk to Docker BEFORE doing anything else
        - Prevent silent failures later in the pipeline

        WHAT THIS CONFIRMS:
        ✔ Docker is installed
        ✔ Docker daemon is running
        ✔ Jenkins user has Docker access
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

        PURPOSE:
        - Build a self-contained Playwright test image
        - Ensures consistent test environment (no local dependency issues)

        WHAT HAPPENS:
        - Uses Dockerfile
        - Installs Node + Playwright + browsers
        - Prepares container to run tests

        OUTPUT:
        - Docker image named "playwright-tests"
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

        PURPOSE:
        - Execute tests in isolated container
        - Avoid host machine dependency conflicts

        IMPORTANT DETAILS:
        - --rm removes container after run (clean builds)
        - Volume mounts export reports back to Jenkins workspace

        RESULT:
        ✔ Tests execute
        ✔ HTML report generated
        ✔ JUnit XML generated
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

        PURPOSE:
        - Allow Jenkins to understand test outcomes
        - Enable trend graphs, failures, history

        REQUIREMENT:
        - Playwright must generate results.xml
        */
        stage('Publish JUnit Report') {
            steps {
                junit 'test-results/results.xml'
            }
        }

        /*
        ======================================================
        STEP 5: PUBLISH HTML REPORT VIA NGINX
        ======================================================

        PURPOSE:
        - Make test report accessible to non-technical users
        - Acts as basic CD-style artifact publishing

        RESULT:
        ✔ Report hosted via Nginx
        ✔ Shareable URL
        */
        stage('Publish Report to Nginx') {
            steps {
                bat '''
                xcopy /E /I /Y playwright-report D:\\Devops\\nginx\\html\\playwright-report
                '''
            }
        }

        /*
        ======================================================
        STEP 6: DISPLAY REPORT ACCESS URL
        ======================================================

        PURPOSE:
        - Clearly show report location in Jenkins logs
        */
        stage('Playwright Report URL') {
            steps {
                echo '================= Playwright HTML Report ================='
                echo '👉 http://localhost/playwright-report/index.html'
                echo '=========================================================='
            }
        }
    }

    /*
    ======================================================
    POST-BUILD ACTIONS (ALWAYS EXECUTE)
    ======================================================

    PURPOSE:
    - Preserve reports even if build fails
    - Enable historical comparison
    */
    post {
        always {
            archiveArtifacts artifacts: 'playwright-report/**/*, test-results/**/*',
                             allowEmptyArchive: true
        }
    }
}
