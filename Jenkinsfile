// =======================================================
// Jenkins Declarative Pipeline Definition
// =======================================================
// PURPOSE:
// - Checkout code from GitHub
// - Install Node dependencies
// - Run Playwright tests
// - Generate Playwright HTML report
// - Generate Allure report
// - Persist Allure history across builds (ORG SAFE)
// =======================================================

pipeline {

  // -----------------------------------------------------
  // AGENT CONFIGURATION
  // -----------------------------------------------------
  // Run on any available Jenkins agent
  agent any


  // -----------------------------------------------------
  // TOOLS CONFIGURATION
  // -----------------------------------------------------
  tools {

    // ---------------------------------------------------
    // NODEJS TOOL
    // ---------------------------------------------------
    // Must match:
    // Manage Jenkins → Global Tool Configuration → NodeJS
    //
    // Ensures:
    // - node
    // - npm
    // - npx
    // are available during pipeline execution
    nodejs 'NodeJS'
  }


  // -----------------------------------------------------
  // PIPELINE STAGES
  // -----------------------------------------------------
  stages {

    // ===================================================
    // STAGE 1: CHECKOUT SOURCE CODE
    // ===================================================
    stage('Checkout') {
      steps {

        // Pulls code from GitHub repository
        // Uses credentials configured in Jenkins job
        checkout scm
      }
    }


    // ===================================================
    // STAGE 2: INSTALL DEPENDENCIES
    // ===================================================
    stage('Install Dependencies') {
      steps {

        // Windows agent → use bat
        //
        // npm ci:
        // - Faster
        // - Uses package-lock.json
        // - Clean install every build (CI best practice)
        bat 'npm ci'
      }
    }


    // ===================================================
    // STAGE 3: RUN PLAYWRIGHT TESTS
    // ===================================================
    stage('Run Playwright Tests') {
      steps {

        // Runs Playwright tests
        //
        // Generates:
        // - playwright-report/  (HTML)
        // - allure-results/     (raw Allure data)
        bat 'npx playwright test'
      }

      post {
        always {

          // Archive Playwright HTML report
          // Accessible from Jenkins build → Artifacts
          archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
        }
      }
    }


    // ===================================================
    // STAGE 4: RESTORE ALLURE HISTORY (ORG SAFE)
    // ===================================================
    stage('Restore Allure History') {
      steps {

        // ------------------------------------------------
        // copyArtifacts
        // ------------------------------------------------
        // Copies history from LAST SUCCESSFUL BUILD
        //
        // Source:
        //   previous_build/allure-report/history
        //
        // Target:
        //   current_build/allure-results/history
        //
        // WHY BEFORE ALLURE GENERATION:
        // - Allure merges history during report build
        //
        // optional: true
        // - Prevents failure on first run
        copyArtifacts(
          projectName: env.JOB_NAME,
          selector: lastSuccessful(),
          filter: 'allure-report/history/**',
          target: 'allure-results',
          optional: true
        )
      }
    }
  }


  // -----------------------------------------------------
  // GLOBAL POST ACTIONS (AFTER ALL STAGES)
  // -----------------------------------------------------
  post {
    always {

      // =================================================
      // ALLURE REPORT GENERATION
      // =================================================
      // Requires:
      // - Allure Jenkins Plugin installed
      // - Allure Commandline configured globally
      //
      // IMPORTANT:
      // commandline MUST MATCH Global Tool name exactly
      allure([
        includeProperties: false,
        jdk: '',
        commandline: 'Allure',
        results: [[path: 'allure-results']]
      ])

      // =================================================
      // ARCHIVE ALLURE REPORT (FOR NEXT BUILD HISTORY)
      // =================================================
      // This step is CRITICAL
      //
      // Without this:
      // - Next build cannot restore history
      //
      // With this:
      // - Trends, duration, flaky stats persist
      archiveArtifacts artifacts: 'allure-report/**', allowEmptyArchive: true
    }
  }
}
