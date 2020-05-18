// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-await-in-loop, no-console, no-process-exit */

/*
 * This command, which normally use in CI, runs Cypress test in full or partial depending on test metadata
 * and environment capabilities, collects test reports and publishes into Mattermost channel via Webhook.
 *
 * Usage: [ENVIRONMENT] node run_tests.js [options]
 *
 * Options:
 *   --stage=[stage]
 *      Selects spec files with matching stage. It can be of multiple values separated by comma.
 *      E.g. "--stage='@prod,@smoke'" will select files with either @prod or @smoke.
 *   --group=[group]
 *      Selects spec files with matching group. It can be of multiple values separated by comma.
 *      E.g. "--group='@channel,@messaging'" will select files with either @channel or @messaging.
 *   --invert
 *      Selected files are those not matching any of the specified stage or group.
 *
 * Environment:
 *   BROWSER=[browser]      : Chrome by default. Set to run test on other browser such as chrome, edge, electron and firefox.
 *                            The environment should have the specified browser to successfully run.
 *   HEADLESS=[boolean]     : Headless by default (true) or false to run on headed mode.
 *   BRANCH=[branch]        : Branch identifier from CI
 *   BUILD_ID=[build_id]    : Build identifier from CI
 *   TYPE=[type]            : Test type, e.g. "DAILY", "PR", RELEASE
 *   WEBHOOK_URL=[url]      : Webhook URL where to send test report
 *
 * Example:
 * 1. "node run_tests.js"
 *      - will run all the specs on default test environment, except those matching skipped metadata
 * 2. "node run_tests.js --stage='@prod'"
 *      - will run all production tests, except those matching skipped metadata
 * 3. "node run_tests.js --stage='@prod' --invert"
 *      - will run all non-production tests
 * 4. "BROWSER='chrome' HEADLESS='false' node run_tests.js --stage='@prod' --group='@channel,@messaging'"
 *      - will run spec files matching stage and group values in Chrome (headed)
 */

const os = require('os');

const chalk = require('chalk');
const cypress = require('cypress');
const fse = require('fs-extra');
const {merge} = require('mochawesome-merge');
const generator = require('mochawesome-report-generator');
const argv = require('yargs').argv;

const {getTestFiles, getSkippedFiles} = require('./utils/file');
const {
    generateDiagnosticReport,
    generateShortSummary,
    generateTestReport,
    getServerInfo,
    sendReport,
    writeJsonToFile
} = require('./utils/report');
const {saveArtifacts} = require('./utils/save_artifacts');
const {saveDashboard} = require('./utils/dashboard');

require('dotenv').config();

async function runTests() {
    const {
        BRANCH,
        BROWSER,
        BUILD_ID,
        CYPRESS_baseUrl, // eslint-disable-line camelcase
        DASHBOARD_ENABLE,
        DIAGNOSTIC_WEBHOOK_URL,
        HEADLESS,
        TYPE,
        WEBHOOK_URL,
    } = process.env;

    const bucketFolder = Date.now();

    await fse.remove('results');
    await fse.remove('screenshots');

    const browser = BROWSER || 'chrome';
    const headless = typeof HEADLESS === 'undefined' ? true : HEADLESS === 'true';
    const platform = os.platform();
    const initialTestFiles = getTestFiles().sort((a, b) => a.localeCompare(b));
    const {finalTestFiles} = getSkippedFiles(initialTestFiles, platform, browser, headless);

    if (!finalTestFiles.length) {
        console.log(chalk.red('Nothing to test!'));
        return;
    }

    const mochawesomeReportDir = 'results/mochawesome-report';
    const {invert, group, stage} = argv;
    let failedTests = 0;

    for (let i = 0; i < finalTestFiles.length; i++) {
        const testFile = finalTestFiles[i];
        const testStage = stage ? `Stage: "${stage}" ` : '';
        const testGroup = group ? `Group: "${group}" ` : '';

        // Log which files were being tested
        console.log(chalk.magenta.bold(`${invert ? 'All Except --> ' : ''}${testStage}${stage && group ? '| ' : ''}${testGroup}`));
        console.log(chalk.magenta(`(Testing ${i + 1} of ${finalTestFiles.length})  - `, testFile));

        const {totalFailed} = await cypress.run({
            browser,
            headless,
            spec: testFile,
            config: {
                screenshotsFolder: `${mochawesomeReportDir}/screenshots`,
                trashAssetsBeforeRuns: false,
            },
            reporter: 'cypress-multi-reporters',
            reporterOptions:
                {
                    reporterEnabled: 'mocha-junit-reporters, mochawesome',
                    mochaJunitReportersReporterOptions: {
                        mochaFile: 'results/junit/test_results[hash].xml',
                        toConsole: false,
                    },
                    mochawesomeReporterOptions: {
                        reportDir: mochawesomeReportDir,
                        reportFilename: `json/${testFile}`,
                        quiet: true,
                        overwrite: false,
                        html: false,
                        json: true,
                        testMeta: {
                            testType: TYPE,
                            platform,
                            browser,
                            headless,
                            branch: BRANCH,
                            buildId: BUILD_ID,
                            bucketFolder,
                        },
                    },
                },
        });

        failedTests += totalFailed;
    }

    // Merge all json reports into one single json report
    const jsonReport = await merge({files: [`${mochawesomeReportDir}/**/*.json`]});
    writeJsonToFile(jsonReport, 'all.json', mochawesomeReportDir);

    // Generate the html report file
    await generator.create(jsonReport, {reportDir: mochawesomeReportDir});

    // Generate short summary, write to file and then send report via webhook
    const summary = generateShortSummary(jsonReport);
    console.log(summary);
    writeJsonToFile(summary, 'summary.json', mochawesomeReportDir);

    const result = await saveArtifacts(`../${mochawesomeReportDir}`, bucketFolder);
    if (result && result.success) {
        console.log('Successfully uploaded artifacts to S3.');
        console.log(`https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${bucketFolder}/mochawesome.html`);
    }

    // Send test report to "QA: UI Test Automation" channel via webhook
    if (TYPE && WEBHOOK_URL) {
        const data = generateTestReport(summary, result && result.success, bucketFolder);
        await sendReport('summary report to Community channel', WEBHOOK_URL, data);
    }

    // Send diagnostic report via webhook
    // Send on "DAILY" type only
    if (TYPE === 'DAILY' && DIAGNOSTIC_WEBHOOK_URL) {
        const baseUrl = CYPRESS_baseUrl || 'http://localhost:8065'; // eslint-disable-line camelcase
        const serverInfo = await getServerInfo(baseUrl);
        const data = generateDiagnosticReport(summary, serverInfo);
        await sendReport('test info for diagnostic analysis', DIAGNOSTIC_WEBHOOK_URL, data);
    }

    // Save data to automation dashboard
    if (DASHBOARD_ENABLE === 'true') {
        await saveDashboard(jsonReport, BRANCH);
    }

    // exit with the number of failed tests
    process.exit(failedTests);
}

runTests();
