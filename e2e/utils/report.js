// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-console */

const axios = require('axios');
const fse = require('fs-extra');

const {MOCHAWESOME_REPORT_DIR} = require('./constants');

const MAX_FAILED_TITLES = 5;

let incrementalDuration = 0;

function getAllTests(results) {
    const tests = [];
    results.forEach((result) => {
        result.tests.forEach((test) => {
            incrementalDuration += test.duration;
            tests.push({...test, incrementalDuration});
        });

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

function removeOldGeneratedReports() {
    [
        'all.json',
        'summary.json',
        'mochawesome.html',
    ].forEach((file) => fse.removeSync(`${MOCHAWESOME_REPORT_DIR}/${file}`));
}

function writeJsonToFile(jsonObject, filename, dir) {
    fse.writeJson(`${dir}/${filename}`, jsonObject).
        then(() => console.log('Successfully written:', filename)).
        catch((err) => console.error(err));
}

function readJsonFromFile(file) {
    try {
        return fse.readJsonSync(file);
    } catch (err) {
        return {err};
    }
}

const result = [
    {status: 'Passed', priority: 'none', cutOff: 100, color: '#43A047'},
    {status: 'Failed', priority: 'low', cutOff: 98, color: '#FFEB3B'},
    {status: 'Failed', priority: 'medium', cutOff: 95, color: '#FF9800'},
    {status: 'Failed', priority: 'high', cutOff: 0, color: '#F44336'},
];

function generateTestReport(summary, isUploadedToS3, reportLink, environment) {
    const {
        BRANCH,
        BUILD_TAG,
        FULL_REPORT,
        PULL_REQUEST,
        TYPE,
    } = process.env;
    const {statsFieldValue, stats} = summary;
    const {
        cypressVersion,
        browserName,
        browserVersion,
        headless,
        osName,
        osVersion,
        nodeVersion,
    } = environment;

    let testResult;
    for (let i = 0; i < result.length; i++) {
        if (stats.passPercent >= result[i].cutOff) {
            testResult = result[i];
            break;
        }
    }

    let awsS3Fields;
    if (isUploadedToS3) {
        awsS3Fields = {
            short: false,
            title: 'Test Report',
            value: `[Link to the report](${reportLink})`,
        };
    }

    let dockerImageLink = '';
    if (BUILD_TAG) {
        dockerImageLink = `with [mattermost-enterprise-edition:${BUILD_TAG}](https://hub.docker.com/r/mattermost/mattermost-enterprise-edition/tags?name=${BUILD_TAG})`;
    }

    let title;

    switch (TYPE) {
    case 'PR':
        title = `E2E for Pull Request Build: [${BRANCH}](${PULL_REQUEST}) ${dockerImageLink}`;
        break;
    case 'RELEASE':
        title = `E2E for Release Build ${dockerImageLink}`;
        break;
    case 'MASTER':
        title = `E2E for Master Nightly Build (Prod tests) ${dockerImageLink}`;
        break;
    case 'MASTER_UNSTABLE':
        title = `E2E for Master Nightly Build (Unstable tests) ${dockerImageLink}`;
        break;
    default:
        title = `E2E for Build ${dockerImageLink}`;
    }

    const envValue = `cypress@${cypressVersion} | node@${nodeVersion} | ${browserName}@${browserVersion}${headless ? ' (headless)' : ''} | ${osName}@${osVersion}`;

    if (FULL_REPORT === 'true') {
        return {
            username: 'Cypress UI Test',
            icon_url: 'https://www.mattermost.org/wp-content/uploads/2016/04/icon.png',
            attachments: [{
                color: testResult.color,
                author_name: 'Webapp End-to-end Testing',
                author_icon: 'https://www.mattermost.org/wp-content/uploads/2016/04/icon.png',
                author_link: 'https://www.mattermost.com',
                title,
                fields: [
                    {
                        short: false,
                        title: 'Environment',
                        value: envValue,
                    },
                    awsS3Fields,
                    {
                        short: false,
                        title: `Key metrics (required support: ${testResult.priority})`,
                        value: statsFieldValue,
                    },
                ],
            }],
        };
    }

    let quickSummary = `${stats.passPercent.toFixed(2)}% (${stats.passes}/${stats.tests}) in ${stats.suites} suites`;
    if (isUploadedToS3) {
        quickSummary = `[${quickSummary}](${reportLink})`;
    }

    return {
        username: 'Cypress UI Test',
        icon_url: 'https://www.mattermost.org/wp-content/uploads/2016/04/icon.png',
        attachments: [{
            color: testResult.color,
            author_name: 'Webapp End-to-end Testing',
            author_icon: 'https://www.mattermost.org/wp-content/uploads/2016/04/icon.png',
            author_link: 'https://www.mattermost.com/',
            title,
            text: `${quickSummary} | ${(stats.duration / (60 * 1000)).toFixed(2)} mins\n${envValue}`,
        }],
    };
}

function generateDiagnosticReport(summary, serverInfo) {
    const {BRANCH, BUILD_ID} = process.env;

    return {
        username: 'Cypress UI Test',
        icon_url: 'https://www.mattermost.org/wp-content/uploads/2016/04/icon.png',
        attachments: [{
            color: '#43A047',
            author_name: 'Cypress UI Test',
            author_icon: 'https://www.mattermost.org/wp-content/uploads/2016/04/icon.png',
            author_link: 'https://community.mattermost.com/core/channels/ui-test-automation',
            title: `Cypress UI Test Automation #${BUILD_ID}, **${BRANCH}** branch`,
            fields: [{
                short: false,
                value: `Start: **${summary.stats.start}**\nEnd: **${summary.stats.end}**\nUser ID: **${serverInfo.userId}**\nTeam ID: **${serverInfo.teamId}**`,
            }],
        }],
    };
}

async function sendReport(name, url, data) {
    const requestOptions = {method: 'POST', url, data};

    try {
        const response = await axios(requestOptions);

        if (response.data) {
            console.log(`Successfully sent ${name}.`);
        }
        return response;
    } catch (er) {
        console.log(`Something went wrong while sending ${name}.`, er);
        return false;
    }
}

module.exports = {
    generateDiagnosticReport,
    generateShortSummary,
    generateTestReport,
    getAllTests,
    removeOldGeneratedReports,
    sendReport,
    readJsonFromFile,
    writeJsonToFile,
};
