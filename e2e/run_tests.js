// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-await-in-loop, no-console */

const os = require('os');

const axios = require('axios');
const chalk = require('chalk');
const cypress = require('cypress');
const fse = require('fs-extra');
const intersection = require('lodash.intersection');
const without = require('lodash.without');
const {merge} = require('mochawesome-merge');
const generator = require('mochawesome-report-generator');
const shell = require('shelljs');
const argv = require('yargs').argv;

const MAX_FAILED_TITLES = 5;
const TEST_DIR = 'cypress/integration';

function getAllTests(results) {
    const tests = [];
    results.forEach((result) => {
        result.tests.forEach((test) => tests.push(test));

        if (result.suites.length > 0) {
            getAllTests(result.suites).forEach((test) => tests.push(test));
        }
    });

    return tests;
}

function generateStatsFieldValue(stats, failedFullTitles) {
    let statsFieldValue = `
| Key | Value |
|:---|:---|
| Passing Rate | ${stats.passPercent.toFixed(2)}% |
| Duration | ${(stats.duration / (60 * 1000)).toFixed(2)} mins |
| Suites | ${stats.suites} |
| Tests | ${stats.tests} |
| :white_check_mark: Passed | ${stats.passes} |
| :x: Failed | ${stats.failures} |
| :fast_forward: Skipped | ${stats.skipped} |
`;

    // If present, add full title of failing tests.
    // Only show per maximum number of failed titles with the last item as "more..." if failing tests are more than that.
    let failedTests;
    if (failedFullTitles && failedFullTitles.length > 0) {
        const re = /[:'"\\]/gi;
        const failed = failedFullTitles;
        if (failed.length > MAX_FAILED_TITLES) {
            failedTests = failed.slice(0, MAX_FAILED_TITLES - 1).map((f) => `- ${f.replace(re, '')}`).join('\n');
            failedTests += '\n- more...';
        } else {
            failedTests = failed.map((f) => `- ${f.replace(re, '')}`).join('\n');
        }
    }

    if (failedTests) {
        statsFieldValue += '###### Failed Tests:\n' + failedTests;
    }

    return statsFieldValue;
}

function generateShortSummary(report) {
    const {results, stats} = report;
    const tests = getAllTests(results);

    const failedFullTitles = tests.filter((t) => t.fail).map((t) => t.fullTitle);
    const statsFieldValue = generateStatsFieldValue(stats, failedFullTitles);

    return {
        stats,
        statsFieldValue,
    };
}

function writeJsonToFile(jsonObject, filename, dir) {
    fse.writeJson(`${dir}/${filename}`, jsonObject).
        then(() => console.log('Success!')).
        catch((err) => console.error(err));
}

const grepCommand = (word = '') => {
    // -r, recursive search on subdirectories
    // -I, ignore binary
    // -l, only names of files to stdout/return
    // -w, expression is searched for as a word
    return `grep -rIlw '${word}' ${TEST_DIR}`;
};

const grepFiles = (command) => {
    return shell.exec(command, {silent: true}).stdout.
        split('\n').
        filter((f) => f.includes('spec.js'));
};

function getTestFiles() {
    const {invert, group, stage} = argv;

    const allFiles = grepFiles(grepCommand());

    const stageFiles = [];
    if (stage) {
        const sc = grepCommand(stage.split(',').join('\\|'));
        stageFiles.push(...grepFiles(sc));
    }
    const groupFiles = [];
    if (group) {
        const gc = grepCommand(group.split(',').join('\\|'));
        groupFiles.push(...grepFiles(gc));
    }

    if (invert) {
        // Return no test file if no stage and group, but inverted
        if (!stage && !group) {
            return [];
        }

        // Return all excluding stage files
        if (stage && !group) {
            return without(allFiles, ...stageFiles);
        }

        // Return all excluding group files
        if (!stage && group) {
            return without(allFiles, ...groupFiles);
        }

        // Return all excluding group and stage files
        return without(allFiles, ...intersection(stageFiles, groupFiles));
    }

    // Return all files if no stage and group flags
    if (!stage && !group) {
        return allFiles;
    }

    // Return stage files if no group flag
    if (stage && !group) {
        return stageFiles;
    }

    // Return group files if no stage flag
    if (!stage && group) {
        return groupFiles;
    }

    // Return files if both in stage and group
    return intersection(stageFiles, groupFiles);
}

function getSkippedFiles(initialTestFiles, platform, browser, headless) {
    const platformFiles = grepFiles(grepCommand(`@${platform}`));
    const browserFiles = grepFiles(grepCommand(`@${browser}`));
    const headlessFiles = grepFiles(grepCommand(`@${headless ? 'headless' : 'headed'}`));

    const initialSkippedFiles = platformFiles.concat(browserFiles, headlessFiles);
    const skippedFiles = intersection(initialTestFiles, initialSkippedFiles);
    const finalTestFiles = without(initialTestFiles, ...skippedFiles);

    // Log which files were skipped
    if (skippedFiles.length) {
        console.log(chalk.cyan(`\nSkipped test files due to ${platform}/${browser} (${headless ? 'headless' : 'headed'}):`));

        skippedFiles.forEach((file, index) => {
            console.log(chalk.cyan(`- [${index + 1}] ${file}`));
        });
        console.log('');
    }

    return {skippedFiles, finalTestFiles};
}

async function runTests() {
    await fse.remove('results');
    await fse.remove('screenshots');

    const BROWSER = process.env.BROWSER || 'chrome';
    const HEADLESS = typeof process.env.HEADLESS === 'undefined' ? true : process.env.HEADLESS === 'true';

    const initialTestFiles = getTestFiles().sort((a, b) => a.localeCompare(b));
    const {finalTestFiles} = getSkippedFiles(initialTestFiles, os.platform(), BROWSER, HEADLESS);

    if (!finalTestFiles.length) {
        console.log(chalk.red('Nothing to test!'));
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
            browser: BROWSER,
            headless: HEADLESS,
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
                    },
                },
        });

        failedTests += totalFailed;
    }

    // Merge all json reports into one single json report
    const jsonReport = await merge({files: [`${mochawesomeReportDir}/**/*.json`]});

    // Generate short summary, write to file and then send report via webhook
    const summary = generateShortSummary(jsonReport);
    writeJsonToFile(summary, 'summary.json', mochawesomeReportDir);
    await sendReport(summary);

    // Generate the html report file
    await generator.create(jsonReport, {reportDir: mochawesomeReportDir});

    // eslint-disable-next-line
    process.exit(failedTests); // exit with the number of failed tests
}

const result = [
    {status: 'Passed', priority: 'none', cutOff: 100, color: '#43A047'},
    {status: 'Failed', priority: 'low', cutOff: 98, color: '#FFEB3B'},
    {status: 'Failed', priority: 'medium', cutOff: 95, color: '#FF9800'},
    {status: 'Failed', priority: 'high', cutOff: 0, color: '#F44336'},
];

function generateReport(summary) {
    const {BRANCH, BROWSER, BUILD_ID} = process.env;
    const {statsFieldValue, stats} = summary;

    let testResult;
    for (let i = 0; i < result.length; i++) {
        if (stats.passPercent >= result[i].cutOff) {
            testResult = result[i];
            break;
        }
    }

    return {
        username: 'Cypress UI Test',
        icon_url: 'https://www.mattermost.org/wp-content/uploads/2016/04/icon.png',
        attachments: [{
            color: testResult.color,
            author_name: 'Cypress UI Test',
            author_icon: 'https://www.mattermost.org/wp-content/uploads/2016/04/icon.png',
            author_link: 'https://www.mattermost.com',
            title: `Cypress UI Test Automation #${BUILD_ID} ${testResult.status}!`,
            fields: [{
                short: false,
                title: 'Environment',
                value: `Branch: **${BRANCH}**, Browser: **${BROWSER}**`,
            }, {
                short: false,
                title: 'Test Report',
                value: `[Link to the report](https://build-push.internal.mattermost.com/job/mattermost-ui-testing/job/mattermost-cypress/${BUILD_ID}/artifact/mattermost-webapp/e2e/results/mochawesome-report/mochawesome.html)`,
            }, {
                short: false,
                title: 'Screenshots',
                value: `[Link to the screenshots](https://build-push.internal.mattermost.com/job/mattermost-ui-testing/job/mattermost-cypress/${BUILD_ID}/artifact/mattermost-webapp/e2e/results/mochawesome-report/screenshots/)`,
            }, {
                short: false,
                title: 'New Commits',
                value: `[Link to the new commits](https://build-push.internal.mattermost.com/job/mattermost-ui-testing/job/mattermost-cypress/${BUILD_ID}/changes)`,
            }, {
                short: false,
                title: `Key metrics (required support: ${testResult.priority})`,
                value: statsFieldValue,
            }],
            image_url: 'https://pbs.twimg.com/profile_images/1044345247440896001/pXI1GDHW_bigger.jpg'
        }],
    };
}

async function sendReport(summary) {
    const data = generateReport(summary);
    try {
        const response = await axios({
            method: 'post',
            url: process.env.WEBHOOK_URL,
            data,
        });

        if (response.data) {
            console.log('Successfully sent report via webhook');
        }
        return response;
    } catch (er) {
        console.log('Something went wrong while sending report via webhook', er);
        return false;
    }
}

runTests();
