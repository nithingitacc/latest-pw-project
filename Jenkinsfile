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
    // Jenkins will:
    // - Auto-install Node.js if missing
    // - Add node, npm, npx to PATH
    //
    // REQUIRED FOR:
    // - Playwright
    // - npm ci
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

        // Pulls source code from the repository
        // configured in the Jenkins job
        checkout scm
      }
    }


    // ===================================================
    // STAGE 2: INSTALL DEPENDENCIES
    // ===================================================
    stage('Install Dependencies') {
      steps {

        // ------------------------------------------------
        // Windows agent → use bat (NOT sh)
        // ------------------------------------------------
        // npm ci:
        // - Clean install
        // - Uses package-lock.json
        // - Faster and stable for CI
        bat 'npm ci'
      }
    }


    // ===================================================
    // STAGE 3: RUN PLAYWRIGHT TESTS
    // ===================================================
    stage('Run Playwright Tests') {
      steps {

        // ------------------------------------------------
        // Execute Playwright tests
        // ------------------------------------------------
        // npx ensures local Playwright version is used
        //
        // Generates:
        // - playwright-report  (HTML report)
        // - allure-results     (raw Allure data)
        bat 'npx playwright test'
      }

      // -------------------------------------------------
      // POST ACTIONS (RUN EVEN IF TESTS FAIL)
      // -------------------------------------------------
      post {
        always {

          // ---------------------------------------------
          // ARCHIVE PLAYWRIGHT HTML REPORT
          // ---------------------------------------------
          // Makes the HTML report downloadable
          // from Jenkins build page
          archiveArtifacts artifacts: 'playwright-report/**',
                           allowEmptyArchive: true
        }
      }
    }
  }


  // -----------------------------------------------------
  // GLOBAL POST ACTIONS (AFTER ALL STAGES)
  // -----------------------------------------------------
  post {
    always {

      // -----------------------------------------------
      // ALLURE REPORT PUBLISHING (FIXED & CORRECT)
      // -----------------------------------------------
      // REQUIREMENTS:
      // 1. Allure Jenkins Plugin installed
      // 2. Allure Commandline configured in:
      //    Manage Jenkins → Global Tool Configuration
      //
      // IMPORTANT:
      // - 'commandline' value MUST match
      //   the Global Tool name exactly
      allure([

        // ---------------------------------------------
        // Disable Jenkins environment properties
        // ---------------------------------------------
        includeProperties: false,

        // ---------------------------------------------
        // JDK selection
        // ---------------------------------------------
        // Empty string means:
        // - Use Jenkins default JDK
        jdk: '',

        // ---------------------------------------------
        // Allure Commandline Tool
        // ---------------------------------------------
        // MUST MATCH:
        // Global Tool Configuration → Allure Commandline → Name
        commandline: 'allure',

        // ---------------------------------------------
        // Allure Results Directory
        // ---------------------------------------------
        // Generated by allure-playwright reporter
        results: [[path: 'allure-results']]
      ])
    }
  }
}
