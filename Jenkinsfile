// =======================================================
// Jenkins Declarative Pipeline
// Playwright + Allure with History Persistence
// =======================================================

pipeline {

  // -----------------------------------------------------
  // AGENT CONFIGURATION
  // -----------------------------------------------------
  // agent any:
  // - Allows Jenkins to run this pipeline on any available agent
  // - Works for single-node or multi-node Jenkins
  agent any


  // -----------------------------------------------------
  // TOOLS CONFIGURATION
  // -----------------------------------------------------
  // tools block ensures required tools are:
  // - Installed (if missing)
  // - Added to PATH automatically during pipeline execution
  tools {

    // nodejs 'NodeJS'
    // - 'NodeJS' must exactly match the name configured in:
    //   Manage Jenkins → Global Tool Configuration → NodeJS
    // - Provides node, npm, npx commands
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

        // checkout scm:
        // - Pulls source code from the repository
        // - Uses repository URL, branch, and credentials
        //   defined in the Jenkins job configuration
        checkout scm
      }
    }


    // ===================================================
    // STAGE 2: INSTALL DEPENDENCIES
    // ===================================================
    stage('Install Dependencies') {

      steps {

        // bat:
        // - Used because Jenkins is running on Windows
        // - 'sh' would be used on Linux agents
        //
        // npm ci:
        // - Faster and cleaner than npm install
        // - Uses package-lock.json
        // - Ideal for CI/CD pipelines
        bat 'npm ci'
      }
    }


    // ===================================================
    // STAGE 3: RUN PLAYWRIGHT TESTS
    // ===================================================
    stage('Run Playwright Tests') {

      steps {

        // npx playwright test:
        // - Runs Playwright using the local project version
        // - Executes all tests
        // - Generates:
        //   1. playwright-report (HTML)
        //   2. allure-results (raw Allure data)
        bat 'npx playwright test'
      }

      // -------------------------------------------------
      // POST ACTIONS FOR THIS STAGE
      // -------------------------------------------------
      post {
        always {

          // archiveArtifacts:
          // - Stores Playwright HTML report as a Jenkins artifact
          // - Makes it downloadable from the Jenkins UI
          //
          // allowEmptyArchive: true
          // - Prevents pipeline failure if report is missing
          archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
        }
      }
    }


    // ===================================================
    // STAGE 4: RESTORE ALLURE HISTORY
    // ===================================================
    // Purpose:
    // - Preserve Allure trends (history, duration, flaky tests)
    // - Copy history from the previous successful Jenkins build
    stage('Restore Allure History') {

      steps {
        script {

          // Ensure allure-results directory exists
          // - Allure expects history to be inside allure-results/history
          bat 'if not exist allure-results mkdir allure-results'

          // copyArtifacts:
          // - Uses Copy Artifact Plugin
          // - Copies artifacts from a previous build of the SAME job
          //
          // projectName: env.JOB_NAME
          // - env.JOB_NAME ensures we copy from the same Jenkins job
          //
          // selector: StatusBuildSelector
          // - stable: false → last SUCCESSFUL build (not only stable)
          //
          // filter:
          // - Only copy Allure history folder
          //
          // optional: true
          // - Pipeline will NOT fail if this is the first build
          copyArtifacts(
            projectName: env.JOB_NAME,
            selector: [$class: 'StatusBuildSelector', stable: false],
            filter: 'allure-report/history/**',
            optional: true
          )

          // Move copied history into allure-results/history
          // - Allure reads previous trends ONLY from this location
          //
          // xcopy flags:
          // /E → copy all subdirectories
          // /I → assume destination is a directory
          // /Y → overwrite without prompt
          bat '''
            if exist allure-report\\history (
              xcopy /E /I /Y allure-report\\history allure-results\\history
            )
          '''
        }
      }
    }
  }


  // -----------------------------------------------------
  // GLOBAL POST ACTIONS
  // -----------------------------------------------------
  post {

    // always:
    // - Runs whether the build passes or fails
    // - Ensures reports are always published
    always {

      // Allure report generation & publishing
      // Requires:
      // - Allure Jenkins Plugin
      // - Allure Commandline configured globally
      allure([
        includeProperties: false,
        results: [[path: 'allure-results']]
      ])

      // Archive generated Allure report
      // - Allows download & long-term storage
      archiveArtifacts artifacts: 'allure-report/**', allowEmptyArchive: true
    }
  }
}
