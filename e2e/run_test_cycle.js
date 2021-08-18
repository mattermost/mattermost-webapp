// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-await-in-loop, no-console */

/*
 * This command, which is normally used in CI, runs Cypress test in full or partial
 * depending on test metadata and environment capabilities.
 * Spec file to run is dependent from Test Automation Dashboard and each test result is being
 * recorded on a per spec file basis.
 *
 * Usage: [ENVIRONMENT] node run_test_cycle.js
 *
 * Environment:
 *   AUTOMATION_DASHBOARD_URL   : Dashboard URL
 *   AUTOMATION_DASHBOARD_TOKEN : Dashboard token
 *   REPO                       : Project repository, ex. mattermost-webapp
 *   BRANCH                     : Branch identifier from CI
 *   BUILD_ID                   : Build identifier from CI
 *   CI_BASE_URL                : Test server base URL in CI
 *
 * Example:
 * 1. "node run_test_cycle.js"
 *      - will run all the specs available from the Automation dashboard
 */

const axios = require('axios');
const axiosRetry = require('axios-retry');
const chalk = require('chalk');
const cypress = require('cypress');

const {
    getSpecToTest,
    recordSpecResult,
    updateCycle,
    uploadScreenshot,
} = require('./utils/dashboard');
const {writeJsonToFile} = require('./utils/report');
const {MOCHAWESOME_REPORT_DIR, RESULTS_DIR} = require('./utils/constants');

require('dotenv').config();
axiosRetry(axios, {
    retries: 5,
    retryDelay: axiosRetry.exponentialDelay,
});

const {
    BRANCH,
    BROWSER,
    BUILD_ID,
    CI_BASE_URL,
    HEADLESS,
    REPO,
} = process.env;

async function runCypressTest(specExecution) {
    const browser = BROWSER || 'chrome';
    const headless = isHeadless();

    const result = await cypress.run({
        browser,
        headless,
        spec: specExecution.file,
        config: {
            screenshotsFolder: `${MOCHAWESOME_REPORT_DIR}/screenshots`,
            trashAssetsBeforeRuns: false,
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
                reportFilename: `json/${specExecution.file}`,
                quiet: true,
                overwrite: false,
                html: false,
                json: true,
                testMeta: {
                    browser,
                    headless,
                    branch: BRANCH,
                    buildId: BUILD_ID,
                },
            },
        },
    });

    return result;
}

async function saveResult(specExecution, result, testIndex) {
    // Write and update test environment details once
    if (testIndex === 0) {
        const environment = {
            cypress_version: result.cypressVersion,
            browser_name: result.browserName,
            browser_version: result.browserVersion,
            headless: isHeadless(),
            os_name: result.osName,
            os_version: result.osVersion,
            node_version: process.version,
        };

        writeJsonToFile(environment, 'environment.json', RESULTS_DIR);
        await updateCycle(specExecution.cycle_id, environment);
    }

    const {stats, tests, spec} = result.runs[0];

    const specPatch = {
        file: spec.relative,
        tests: spec.tests,
        pass: stats.passes,
        fail: stats.failures,
        pending: stats.pending,
        skipped: stats.skipped,
        duration: stats.duration || 0,
        test_start_at: stats.startedAt,
        test_end_at: stats.endedAt,
    };

    const uploadedScreenshots = [];
    tests.forEach((t) => {
        const attempts = t.attempts[0];
        if (attempts.screenshots && attempts.screenshots.length > 0) {
            const path = t.attempts[0].screenshots[0].path;
            uploadedScreenshots.push(uploadScreenshot(path, REPO, BRANCH, BUILD_ID));
        }
    });
    const screenshotUrls = await Promise.all(uploadedScreenshots);

    const testCases = [];
    tests.forEach((t, i) => {
        const attempts = t.attempts[0];

        const test = {
            title: t.title,
            full_title: t.title.join(' '),
            state: attempts.state,
            duration: attempts.duration || 0,
            code: trimToMaxLength(t.body),
        };

        if (attempts.startedAt) {
            test.test_start_at = attempts.startedAt;
        }

        if (t.displayError) {
            test.error_display = trimToMaxLength(t.displayError);
        }

        const errorFrame = attempts.error && attempts.error.codeFrame && attempts.error.codeFrame.frame;
        if (errorFrame) {
            test.error_frame = trimToMaxLength(errorFrame);
        }

        const screenshot = {};
        if (attempts.screenshots && attempts.screenshots.length > 0) {
            const {takenAt, height, width} = attempts.screenshots[0];
            screenshot.url = screenshotUrls[i];
            screenshot.taken_at = takenAt;
            screenshot.height = height;
            screenshot.width = width;

            test.screenshot = screenshot;
        }

        testCases.push(test);
    });

    await recordSpecResult(specExecution.id, specPatch, testCases);
}

function isHeadless() {
    return typeof HEADLESS === 'undefined' ? true : HEADLESS === 'true';
}

function trimToMaxLength(text) {
    const maxLength = 5000;
    return text && text.length > maxLength ? text.substring(0, maxLength) : text;
}

function printSummary(summary) {
    const obj = summary.reduce((acc, item) => {
        const {server, state, count} = item;
        if (!server) {
            return acc;
        }

        if (acc[server]) {
            acc[server][state] = count;
        } else {
            acc[server] = {[state]: count, server};
        }

        return acc;
    }, {});

    Object.values(obj).sort((a, b) => {
        return a.server.localeCompare(b.server);
    }).forEach((item) => {
        const {server, done, started} = item;
        console.log(chalk.magenta(`${server}: done: ${done || 0}, started: ${started || 0}`));
    });
}

const maxRetryCount = 5;
async function runSpecFragment(count, retry) {
    console.log(chalk.magenta(`Preparing for: ${count + 1}`));

    const spec = await getSpecToTest({
        repo: REPO,
        branch: BRANCH,
        build: BUILD_ID,
        server: CI_BASE_URL,
    });

    // Retry on connection/timeout errors
    if (!spec || spec.code) {
        if (retry >= maxRetryCount) {
            return {
                tryNext: false,
                count,
                message: `Test ended due to multiple (${retry}) connection/timeout errors with the dashboard server.`,
            };
        }

        console.log(chalk.red(`Retry count: ${retry}`));
        return runSpecFragment(count, retry + 1);
    }

    if (!spec.execution || !spec.execution.file) {
        return {
            tryNext: false,
            count,
            message: spec.message,
        };
    }

    const currentTestCount = spec.summary.reduce((total, item) => {
        return total + parseInt(item.count, 10);
    }, 0);

    printSummary(spec.summary);
    console.log(chalk.magenta(`\n(Testing ${currentTestCount} of ${spec.cycle.specs_registered}) - ${spec.execution.file}`));
    console.log(chalk.magenta(`At "${process.env.CI_BASE_URL}" server`));

    const result = await runCypressTest(spec.execution);
    await saveResult(spec.execution, result, count);

    const newCount = count + 1;

    if (spec.cycle.specs_registered === currentTestCount) {
        return {
            tryNext: false,
            count: newCount,
            message: `Completed testing of all registered ${currentTestCount} spec/s.`,
        };
    }

    return {
        tryNext: true,
        count: newCount,
        retry: 0,
        message: 'Continue testing',
    };
}

async function runSpec(count = 0, retry = 0) {
    const fragment = await runSpecFragment(count, retry);
    if (fragment.tryNext) {
        return runSpec(fragment.count, fragment.retry);
    }

    return {
        count: fragment.count,
        message: fragment.message,
    };
}

runSpec().then(({count, message}) => {
    console.log(chalk.magenta(message));
    if (count > 0) {
        console.log(chalk.magenta(`This test runner has completed ${count} spec file/s.`));
    }
});
