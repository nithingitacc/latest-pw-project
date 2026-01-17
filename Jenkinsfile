// =======================================================
// JENKINS DECLARATIVE PIPELINE
// =======================================================
// This pipeline executes Playwright tests and
// securely publishes Allure reports inside Jenkins
// =======================================================

pipeline {

  // -----------------------------------------------------
  // AGENT CONFIGURATION
  // -----------------------------------------------------
  // agent any means:
  // - Jenkins can run this pipeline on any available agent
  // - Useful when no node-specific constraints exist
  // - Common default for CI pipelines
  agent any


  // -----------------------------------------------------
  // TOOLS CONFIGURATION
  // -----------------------------------------------------
  // Tools block defines external tools required by the job
  // These tools must be configured globally in Jenkins
  tools {

    // nodejs 'NodeJS'
    // - Refers to a NodeJS installation configured under:
    //   Manage Jenkins → Global Tool Configuration
    // - Makes node, npm, and npx available during pipeline execution
    // - Required for Playwright and npm commands
    nodejs 'NodeJS'
  }


  // -----------------------------------------------------
  // PIPELINE STAGES
  // -----------------------------------------------------
  // Stages define the logical steps of the CI pipeline
  stages {

    // ---------------------------------------------------
    // STAGE 1: CHECKOUT SOURCE CODE
    // ---------------------------------------------------
    stage('Checkout') {
      steps {

        // checkout scm
        // - Pulls source code from the configured SCM
        // - Uses repository URL and branch set in Jenkins job
        // - Ensures latest code is available for the build
        checkout scm
      }
    }


    // ---------------------------------------------------
    // STAGE 2: INSTALL DEPENDENCIES
    // ---------------------------------------------------
    stage('Install Dependencies') {
      steps {

        // npm ci
        // - Performs a clean installation of dependencies
        // - Uses package-lock.json for exact versions
        // - Faster and more reliable than npm install
        // - Recommended approach for CI/CD pipelines
        sh 'npm ci'
      }
    }


    // ---------------------------------------------------
    // STAGE 3: RUN PLAYWRIGHT TESTS
    // ---------------------------------------------------
    stage('Run Playwright Tests') {
      steps {

        // npx playwright test
        // - Executes all Playwright tests defined in the project
        // - Generates multiple outputs:
        //   1. playwright-report/ → HTML report
        //   2. allure-results/   → Raw Allure data
        //   3. JUnit XML         → If configured in Playwright
        sh 'npx playwright test'
      }

      // -------------------------------------------------
      // POST-ACTIONS FOR THIS STAGE
      // -------------------------------------------------
      post {
        always {

          // archiveArtifacts
          // - Saves generated files as Jenkins build artifacts
          // - Artifacts can be downloaded from Jenkins UI
          //
          // artifacts: 'playwright-report/**'
          // - Archives the Playwright HTML report
          //
          // allowEmptyArchive: true
          // - Prevents pipeline failure if the folder is missing
          // - Useful when tests fail before report generation
          archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
        }
      }
    }
  }


  // -----------------------------------------------------
  // PIPELINE-LEVEL POST ACTIONS
  // -----------------------------------------------------
  // These actions run after ALL stages complete
  post {
    always {

      // allure(...)
      // - Provided by the Jenkins Allure Plugin
      // - Reads raw results from allure-results/
      // - Generates and publishes an Allure HTML report
      // - Report is accessible via Jenkins UI (secured)
      allure([

        // includeProperties: false
        // - Excludes Jenkins build properties from report
        // - Keeps Allure report clean and focused on tests
        includeProperties: false,

        // results
        // - Specifies location of Allure raw result files
        // - Must match Playwright Allure reporter output path
        results: [[path: 'allure-results']]
      ])
    }
  }
}
