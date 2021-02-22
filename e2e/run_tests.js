// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-await-in-loop, no-console */

/*
 * This command, which normally use in CI, runs Cypress test in full or partial
 * depending on test metadata and environment capabilities.
 *
 * Usage: [ENVIRONMENT] node run_tests.js [options]
 *
 * Options:
 *   --stage=[stage]
 *      Selects spec files with matching stage. It can be of multiple values separated by comma.
 *      E.g. "--stage='@prod,@dev'" will select files with either @prod or @dev.
 *   --group=[group]
 *      Selects spec files with matching group. It can be of multiple values separated by comma.
 *      E.g. "--group='@channel,@messaging'" will select files with either @channel or @messaging.
 *   --exclude-group=[group]
 *      Exclude spec files with matching group. It can be of multiple values separated by comma.
 *      E.g. "--exclude-group='@enterprise'" will select files except @enterprise.
 *   --invert
 *      Selected files are those not matching any of the specified stage or group.
 *
 * Environment:
 *   BROWSER=[browser]          : Chrome by default. Set to run test on other browser such as chrome, edge, electron and firefox.
 *                                The environment should have the specified browser to successfully run.
 *   HEADLESS=[boolean]         : Headless by default (true) or false to run on headed mode.
 *   BRANCH=[branch]            : Branch identifier from CI
 *   BUILD_ID=[build_id]        : Build identifier from CI
 *   CI_BASE_URL=[ci_base_url]  : Test server base URL in CI
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
 * 5. "node run_tests.js --stage='@prod' --exclude-group='@enterprise'"
 *      - will run all production tests except @enterprise group
 *      - typical test run for Team Edition
 * 6. "node run_tests.js --stage='@prod' --part=1 --of=2"
 *      - will run the first half (1 of 2) of all production tests
 *      - will be used for parallel testing where each part could run separately against its own test server
 */

const os = require('os');
const chalk = require('chalk');
const cypress = require('cypress');
const argv = require('yargs').argv;

const {getTestFiles, getSkippedFiles} = require('./utils/file');
const {getTestFilesIdentifier} = require('./utils/even_distribution');
const {writeJsonToFile} = require('./utils/report');
const {MOCHAWESOME_REPORT_DIR, RESULTS_DIR} = require('./utils/constants');

require('dotenv').config();

async function runTests() {
    const {
        BRANCH,
        BROWSER,
        BUILD_ID,
        HEADLESS,
        ENABLE_VISUAL_TEST,
        APPLITOOLS_API_KEY,
        APPLITOOLS_BATCH_NAME,
    } = process.env;

    const browser = BROWSER || 'chrome';
    const headless = typeof HEADLESS === 'undefined' ? true : HEADLESS === 'true';
    const platform = os.platform();
    const initialTestFiles = getTestFiles().sort((a, b) => a.localeCompare(b));
    const {finalTestFiles} = getSkippedFiles(initialTestFiles, platform, browser, headless);
    const numberOfTestFiles = finalTestFiles.length;

    if (!numberOfTestFiles) {
        console.log(chalk.red('Nothing to test!'));
        return;
    }

    const {
        start,
        end,
        count,
    } = getTestFilesIdentifier(numberOfTestFiles, argv.part, argv.of);

    for (let i = start, j = 0; i < end && j < count; i++, j++) {
        printMessage(finalTestFiles, i, j + 1, count);

        const testFile = finalTestFiles[i];

        const result = await cypress.run({
            browser,
            headless,
            spec: testFile,
            config: {
                screenshotsFolder: `${MOCHAWESOME_REPORT_DIR}/screenshots`,
                trashAssetsBeforeRuns: false,
            },
            env: {
                enableVisualTest: ENABLE_VISUAL_TEST,
                enableApplitools: Boolean(APPLITOOLS_API_KEY),
                batchName: APPLITOOLS_BATCH_NAME,
                firstTest: j === 0,
            },
            reporter: 'cypress-multi-reporters',
            reporterOptions: {
                reporterEnabled: 'mocha-junit-reporters, mochawesome',
                mochaJunitReportersReporterOptions: {
                    mochaFile: 'results/junit/test_results[hash].xml',
                    toConsole: false,
                },
                mochawesomeReporterOptions: {
                    reportDir: MOCHAWESOME_REPORT_DIR,
                    reportFilename: `json/${testFile}`,
                    quiet: true,
                    overwrite: false,
                    html: false,
                    json: true,
                    testMeta: {
                        platform,
                        browser,
                        headless,
                        branch: BRANCH,
                        buildId: BUILD_ID,
                    },
                },
            },
        });

        // Write test environment details once only
        if (i === 0) {
            const environment = {
                cypressVersion: result.cypressVersion,
                browserName: result.browserName,
                browserVersion: result.browserVersion,
                headless,
                osName: result.osName,
                osVersion: result.osVersion,
                nodeVersion: process.version,
            };

            writeJsonToFile(environment, 'environment.json', RESULTS_DIR);
        }
    }
}

function printMessage(testFiles, overallIndex, currentItem, lastItem) {
    const {invert, excludeGroup, group, stage} = argv;

    const testFile = testFiles[overallIndex];
    const testStage = stage ? `Stage: "${stage}" ` : '';
    const withGroup = group || excludeGroup;
    const groupMessage = group ? `"${group}"` : 'All';
    const excludeGroupMessage = excludeGroup ? `except "${excludeGroup}"` : '';
    const testGroup = withGroup ? `Group: ${groupMessage} ${excludeGroupMessage}` : '';

    // Log which files were being tested
    console.log(chalk.magenta.bold(`${invert ? 'All Except --> ' : ''}${testStage}${stage && withGroup ? '| ' : ''}${testGroup}`));
    console.log(chalk.magenta(`(Testing ${overallIndex + 1} of ${testFiles.length})  - `, testFile));
    if (process.env.CI_BASE_URL) {
        console.log(chalk.magenta(`Testing ${currentItem}/${lastItem} in "${process.env.CI_BASE_URL}" server`));
    }
}

runTests();
