// ======================================================================
// JENKINS DECLARATIVE PIPELINE
// Purpose:
// - Checkout Playwright project
// - Install dependencies
// - Run Playwright tests
// - Generate & preserve Allure reports with history
// - Send Gmail notifications for SUCCESS / UNSTABLE / FAILURE
//
// IMPORTANT:
// - Requires NodeJS tool configured in Jenkins
// - Requires Allure Commandline tool configured in Jenkins
// - Requires Email Extension Plugin configured with Gmail SMTP
// ======================================================================

pipeline {

  // --------------------------------------------------------------------
  // AGENT
  // --------------------------------------------------------------------
  // "agent any" means:
  // Jenkins can run this pipeline on any available node/agent
  agent any

  // --------------------------------------------------------------------
  // TOOLS
  // --------------------------------------------------------------------
  tools {
    // Uses NodeJS installed via:
    // Manage Jenkins → Global Tool Configuration → NodeJS
    // The name "NodeJS" MUST exactly match the configured tool name
    nodejs 'NodeJS'
  }

  // --------------------------------------------------------------------
  // STAGES
  // --------------------------------------------------------------------
  stages {

    // ================================================================
    // STAGE 1: CHECKOUT SOURCE CODE
    // ================================================================
    stage('Checkout') {
      steps {
        // Checks out the same repository where this Jenkinsfile exists
        // Uses configured SCM credentials automatically
        checkout scm
      }
    }

    // ================================================================
    // STAGE 2: INSTALL DEPENDENCIES
    // ================================================================
    stage('Install Dependencies') {
      steps {
        // "npm ci" ensures:
        // - Clean install
        // - Exact versions from package-lock.json
        // - Faster and reproducible CI builds
        bat 'npm ci'
      }
    }

    // ================================================================
    // STAGE 3: RUN PLAYWRIGHT TESTS
    // ================================================================
    stage('Run Playwright Tests') {
      steps {
        // Runs Playwright test suite
        // Generates:
        // - playwright-report (HTML)
        // - allure-results (raw results for Allure)
        bat 'npx playwright test'
      }

      post {
        always {
          // Archives Playwright HTML report even if tests fail
          // "allowEmptyArchive" prevents pipeline failure if folder is missing
          archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
        }
      }
    }

    // ================================================================
    // STAGE 4: RESTORE ALLURE HISTORY
    // ================================================================
    stage('Restore Allure History') {
      steps {
        script {

          // Build number of previous execution
          // Example: current build = 10 → previous = 9
          def previousBuild = env.BUILD_NUMBER.toInteger() - 1

          // Absolute path to previous build's Allure history folder
          def historyPath = "${env.JENKINS_HOME}/jobs/${env.JOB_NAME}/builds/${previousBuild}/allure-report/history"

          // Check if previous history exists before copying
          if (fileExists(historyPath)) {

            // Log for visibility
            echo "Restoring Allure history from build #${previousBuild}"

            // Windows copy command:
            // /E → copy subdirectories including empty ones
            // /I → assume destination is directory
            // /Y → overwrite without prompt
            bat "xcopy /E /I /Y \"${historyPath}\" allure-results\\history"

          } else {

            // Happens on first build or if history was deleted
            echo "No previous Allure history found"
          }
        }
      }
    }
  }

  // --------------------------------------------------------------------
  // POST ACTIONS (GLOBAL)
  // --------------------------------------------------------------------
  post {

    // ================================================================
    // ALWAYS: GENERATE & PUBLISH ALLURE REPORT
    // ================================================================
    always {

      // Generates Allure report from allure-results
      // "commandline" must match the Allure tool name in Jenkins
      allure([
        includeProperties: false,
        jdk: '',
        commandline: 'Allure',
        results: [[path: 'allure-results']]
      ])

      // Archive generated Allure report for future history restoration
      archiveArtifacts artifacts: 'allure-report/**', allowEmptyArchive: true
    }

    // ================================================================
    // SUCCESS EMAIL
    // ================================================================
    success {
      emailext(

        // IMPORTANT:
        // Gmail requires a valid "from" address
        // Missing this causes silent email drop
        from: 'Jenkins CI <nithin.jenkins@gmail.com>',

        // Recipient email address
        to: 'nithin.jenkins@gmail.com',

        // Email subject line
        subject: "✅ Jenkins Build SUCCESS - ${env.JOB_NAME} #${env.BUILD_NUMBER}",

        // HTML email body
        body: """
          <h2 style="color:green;">Playwright Automation – Build Successful</h2>

          <p><b>Job:</b> ${env.JOB_NAME}</p>
          <p><b>Build Number:</b> ${env.BUILD_NUMBER}</p>
          <p><b>Status:</b> SUCCESS</p>

          <p>
            🔗 <a href="${env.BUILD_URL}">Jenkins Build</a><br/>
            📊 <a href="${env.BUILD_URL}allure">Allure Report</a>
          </p>

          <p>All tests passed successfully.</p>
        """,

        // Explicitly tell Jenkins this is HTML
        mimeType: 'text/html'
      )
    }

    // ================================================================
    // UNSTABLE EMAIL
    // ================================================================
    unstable {
      emailext(
        from: 'Jenkins CI <nithin.jenkins@gmail.com>',
        to: 'nithin.jenkins@gmail.com',
        subject: "⚠️ Jenkins Build UNSTABLE - ${env.JOB_NAME} #${env.BUILD_NUMBER}",

        body: """
          <h2 style="color:orange;">Build Unstable</h2>

          <p><b>Job:</b> ${env.JOB_NAME}</p>
          <p><b>Build Number:</b> ${env.BUILD_NUMBER}</p>
          <p><b>Status:</b> UNSTABLE</p>

          <p>
            Some tests were flaky, retried, or partially failed.
          </p>

          <p>
            🔗 <a href="${env.BUILD_URL}">Jenkins Build</a><br/>
            📊 <a href="${env.BUILD_URL}allure">Allure Report</a>
          </p>
        """,

        mimeType: 'text/html'
      )
    }

    // ================================================================
    // FAILURE EMAIL
    // ================================================================
    failure {
      emailext(
        from: 'Jenkins CI <nithin.jenkins@gmail.com>',
        to: 'nithin.jenkins@gmail.com',
        subject: "❌ Jenkins Build FAILED - ${env.JOB_NAME} #${env.BUILD_NUMBER}",

        body: """
          <h2 style="color:red;">Playwright Automation – Build Failed</h2>

          <p><b>Job:</b> ${env.JOB_NAME}</p>
          <p><b>Build Number:</b> ${env.BUILD_NUMBER}</p>
          <p><b>Status:</b> FAILED</p>

          <p>
            🔗 <a href="${env.BUILD_URL}">Jenkins Console</a><br/>
            📊 <a href="${env.BUILD_URL}allure">Allure Report</a>
          </p>

          <p>Please review logs and failed test cases.</p>
        """,

        mimeType: 'text/html'
      )
    }
  }
}
