// =======================================================
// Jenkins Declarative Pipeline
// Playwright + Allure + Allure History + Email Notification
// =======================================================

pipeline {

  // -----------------------------------------------------
  // AGENT
  // -----------------------------------------------------
  agent any

  // -----------------------------------------------------
  // TOOLS
  // -----------------------------------------------------
  tools {
    // NodeJS configured in:
    // Manage Jenkins → Global Tool Configuration
    nodejs 'NodeJS'
  }

  // -----------------------------------------------------
  // STAGES
  // -----------------------------------------------------
  stages {

    // =============================
    // CHECKOUT SOURCE CODE
    // =============================
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    // =============================
    // INSTALL DEPENDENCIES
    // =============================
    stage('Install Dependencies') {
      steps {
        // Clean & reproducible install
        bat 'npm ci'
      }
    }

    // =============================
    // RUN PLAYWRIGHT TESTS
    // =============================
    stage('Run Playwright Tests') {
      steps {
        // Executes tests
        // Generates:
        // - playwright-report
        // - allure-results
        bat 'npx playwright test'
      }

      post {
        always {
          // Archive Playwright HTML report
          archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
        }
      }
    }

    // =============================
    // RESTORE ALLURE HISTORY
    // =============================
    stage('Restore Allure History') {
      steps {
        script {
          // Path to previous build Allure history
          def historyPath = "${env.JENKINS_HOME}/jobs/${env.JOB_NAME}/builds/${env.BUILD_NUMBER.toInteger() - 1}/allure-report/history"

          // Restore only if history exists
          if (fileExists(historyPath)) {
            echo "Restoring Allure history from previous build"
            bat "xcopy /E /I /Y \"${historyPath}\" allure-results\\history"
          } else {
            echo "No previous Allure history found"
          }
        }
      }
    }
  }

  // -----------------------------------------------------
  // POST ACTIONS (GLOBAL)
  // -----------------------------------------------------
  post {

    // =============================
    // ALWAYS – GENERATE ALLURE
    // =============================
    always {

      // Generate & publish Allure report
      allure([
        includeProperties: false,
        jdk: '',
        commandline: 'Allure',    // MUST match Global Tool name
        results: [[path: 'allure-results']]
      ])

      // Archive Allure report
      archiveArtifacts artifacts: 'allure-report/**', allowEmptyArchive: true
    }

    // =============================
    // BUILD SUCCESS EMAIL
    // =============================
    success {
      emailext(
        subject: "✅ Jenkins Build SUCCESS - ${env.JOB_NAME} #${env.BUILD_NUMBER}",

        body: """
          <h2 style="color:green;">Playwright Automation – Build Successful</h2>

          <p><b>Job:</b> ${env.JOB_NAME}</p>
          <p><b>Build:</b> ${env.BUILD_NUMBER}</p>
          <p><b>Status:</b> SUCCESS</p>

          <p>
            🔗 <a href="${env.BUILD_URL}">Jenkins Build</a><br/>
            📊 <a href="${env.BUILD_URL}allure">Allure Report</a>
          </p>

          <p>All tests passed successfully.</p>
        """,

        to: "qa-team@company.com",
        mimeType: 'text/html'
      )
    }

    // =============================
    // BUILD FAILURE EMAIL
    // =============================
    failure {
      emailext(
        subject: "❌ Jenkins Build FAILED - ${env.JOB_NAME} #${env.BUILD_NUMBER}",

        body: """
          <h2 style="color:red;">Playwright Automation – Build Failed</h2>

          <p><b>Job:</b> ${env.JOB_NAME}</p>
          <p><b>Build:</b> ${env.BUILD_NUMBER}</p>
          <p><b>Status:</b> FAILED</p>

          <p>
            🔗 <a href="${env.BUILD_URL}">Jenkins Console</a><br/>
            📊 <a href="${env.BUILD_URL}allure">Allure Report</a>
          </p>

          <p>Please review logs and failed test cases.</p>
        """,

        to: "qa-team@company.com,dev-team@company.com",
        mimeType: 'text/html'
      )
    }
  }
}
