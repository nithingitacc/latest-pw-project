// -------------------------------------------------------
// Import Playwright's configuration helper
// -------------------------------------------------------
// defineConfig helps with:
// - Type safety
// - Auto-completion in editors (VS Code)
// - Cleaner structure
import { defineConfig } from '@playwright/test';


// -------------------------------------------------------
// Export Playwright Test Configuration
// -------------------------------------------------------
export default defineConfig({

  /*
  =======================================================
  REPORTER CONFIGURATION
  =======================================================

  PURPOSE:
  - Define how test results are generated and stored
  - Enable both human-readable and CI-friendly reports

  WHY MULTIPLE REPORTERS:
  - HTML → For manual review (QA, Managers, Stakeholders)
  - JUnit XML → For Jenkins CI (Test Results tab)
  */
  reporter: [

    /*
    -------------------------------------------------------
    HTML REPORTER
    -------------------------------------------------------
    PURPOSE:
    - Rich, interactive report
    - Screenshots, videos, traces linked per test

    CONFIG:
    - outputFolder: Where HTML files are generated
    - open: 'never' → Prevent auto-opening browser
      (important for CI servers like Jenkins)
    */
    ['html', {
      outputFolder: 'playwright-report',
      open: 'never'
    }],

    /*
    -------------------------------------------------------
    JUNIT REPORTER
    -------------------------------------------------------
    PURPOSE:
    - Machine-readable test result format
    - Jenkins reads this to show pass/fail trends

    IMPORTANT:
    - Jenkins junit step looks for this file
    */
    ['junit', {
      outputFile: 'test-results/results.xml'
    }]
  ],

  /*
  =======================================================
  TEST EXECUTION SETTINGS (use block)
  =======================================================

  PURPOSE:
  - Define default browser & debugging behavior
  - Applies to ALL tests unless overridden
  */
  use: {

    /*
    -------------------------------------------------------
    HEADLESS MODE
    -------------------------------------------------------
    true  → Browser runs without UI (CI-friendly)
    false → Visible browser (local debugging)

    BEST PRACTICE:
    - Always true in Jenkins / Docker
    */
    headless: true,

    /*
    -------------------------------------------------------
    SCREENSHOT CAPTURE
    -------------------------------------------------------
    'on' → Screenshot taken on test failure
    OPTIONS:
    - 'off'
    - 'on'
    - 'only-on-failure'

    BENEFIT:
    - Helps debug UI failures from reports
    */
    screenshot: 'on',

    /*
    -------------------------------------------------------
    TRACE RECORDING
    -------------------------------------------------------
    'on' → Record trace for every test
    Trace includes:
    - DOM snapshots
    - Network requests
    - Console logs
    - Screenshots

    NOTE:
    - Viewable directly in Playwright HTML report
    */
    trace: 'on',

    /*
    -------------------------------------------------------
    VIDEO RECORDING
    -------------------------------------------------------
    'on' → Record video of test execution
    OPTIONS:
    - 'off'
    - 'on'
    - 'retain-on-failure'

    BEST PRACTICE:
    - 'on' or 'retain-on-failure' for CI pipelines
    */
    video: 'on'
  }
});