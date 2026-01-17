// =======================================================
// Jenkins Declarative Pipeline Definition
// =======================================================
// This file defines how Jenkins should:
// - Fetch code
// - Install dependencies
// - Run Playwright tests
// - Publish HTML + Allure reports
// =======================================================

pipeline {

  // -----------------------------------------------------
  // AGENT CONFIGURATION
  // -----------------------------------------------------
  // agent any means:
  // - Jenkins can run this pipeline on ANY available agent
  // - Works for single-node Jenkins or distributed setups
  agent any


  // -----------------------------------------------------
  // TOOLS CONFIGURATION
  // -----------------------------------------------------
  // tools block allows Jenkins to automatically:
  // - Download required tools
  // - Add them to PATH during pipeline execution
  tools {

    // ---------------------------------------------------
    // NODEJS TOOL
    // ---------------------------------------------------
    // 'NodeJS' is the NAME configured in:
    // Manage Jenkins → Global Tool Configuration → NodeJS
    //
    // What Jenkins does internally:
    // - Downloads Node.js (if not already present)
    // - Exposes node, npm, npx commands to this pipeline
    //
    // WHY THIS IS IMPORTANT:
    // - Playwright is Node-based
    // - Avoids "npm not recognized" errors
    nodejs 'NodeJS'
  }


  // -----------------------------------------------------
  // PIPELINE STAGES
  // -----------------------------------------------------
  // Each stage represents a logical step in CI execution
  stages {

    // ===================================================
    // STAGE 1: CHECKOUT SOURCE CODE
    // ===================================================
    stage('Checkout') {

      steps {

        // -----------------------------------------------
        // checkout scm
        // -----------------------------------------------
        // scm = Source Control Management
        //
        // This command:
        // - Pulls code from the repository configured
        //   in the Jenkins job (GitHub/GitLab/Bitbucket)
        // - Uses branch, credentials, and URL from job config
        checkout scm
      }
    }


    // ===================================================
    // STAGE 2: INSTALL DEPENDENCIES
    // ===================================================
    stage('Install Dependencies') {

      steps {

        // -----------------------------------------------
        // bat command (Windows agent)
        // -----------------------------------------------
        // IMPORTANT:
        // - Jenkins is running on Windows
        // - 'sh' works ONLY on Linux/Unix
        // - 'bat' is required for Windows
        //
        // npm ci:
        // - Faster than npm install
        // - Uses package-lock.json
        // - Ensures clean & reproducible installs
        //
        // BEST PRACTICE FOR CI
        bat 'npm ci'
      }
    }


    // ===================================================
    // STAGE 3: RUN PLAYWRIGHT TESTS
    // ===================================================
    stage('Run Playwright Tests') {

      steps {

        // -----------------------------------------------
        // Execute Playwright Test Runner
        // -----------------------------------------------
        // npx:
        // - Runs local Playwright from node_modules
        // - Ensures correct project version is used
        //
        // This command:
        // - Executes all Playwright tests
        // - Generates:
        //   - playwright-report (HTML)
        //   - allure-results (raw Allure data)
        bat 'npx playwright test'
      }


      // -------------------------------------------------
      // POST ACTIONS FOR THIS STAGE
      // -------------------------------------------------
      // These steps run AFTER test execution
      post {

        // always:
        // - Runs even if tests FAIL
        // - Ensures reports are not lost
        always {

          // ---------------------------------------------
          // ARCHIVE PLAYWRIGHT HTML REPORT
          // ---------------------------------------------
          // What this does:
          // - Stores HTML report as Jenkins build artifact
          // - Allows download/view from Jenkins UI
          //
          // allowEmptyArchive: true
          // - Prevents pipeline failure if report is missing
          //   (example: early crash)
          archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
        }
      }
    }
  }


  // -----------------------------------------------------
  // GLOBAL POST ACTIONS (AFTER ALL STAGES)
  // -----------------------------------------------------
  post {

    // always:
    // - Runs regardless of pipeline success/failure
    // - Ideal for publishing reports
    always {

      // -----------------------------------------------
      // ALLURE REPORT PUBLISHING
      // -----------------------------------------------
      // Requires:
      // - Allure Jenkins Plugin installed
      // - Allure Commandline configured globally
      //
      // allure-results:
      // - Generated by allure-playwright reporter
      // - Contains raw JSON test data
      allure([

        // includeProperties: false
        // - Skips Jenkins build environment metadata
        includeProperties: false,

        // results:
        // - Path where Allure raw results are stored
        // - Jenkins reads from here to build report UI
        results: [[path: 'allure-results']]
      ])
    }
  }
}
