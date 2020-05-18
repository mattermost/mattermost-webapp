// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-console */

const axios = require('axios');
const fse = require('fs-extra');

const users = require('../cypress/fixtures/users.json');

const MAX_FAILED_TITLES = 5;

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
        then(() => console.log('Successfully written:', filename)).
        catch((err) => console.error(err));
}

const result = [
    {status: 'Passed', priority: 'none', cutOff: 100, color: '#43A047'},
    {status: 'Failed', priority: 'low', cutOff: 98, color: '#FFEB3B'},
    {status: 'Failed', priority: 'medium', cutOff: 95, color: '#FF9800'},
    {status: 'Failed', priority: 'high', cutOff: 0, color: '#F44336'},
];

function generateTestReport(summary, isUploadedToS3, bucketFolder) {
    const {BRANCH, BROWSER} = process.env;
    const {statsFieldValue, stats} = summary;

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
            value: `[Link to the report](https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${bucketFolder}/mochawesome.html)`,
        };
    }

    return {
        username: 'Cypress UI Test',
        icon_url: 'https://www.mattermost.org/wp-content/uploads/2016/04/icon.png',
        attachments: [{
            color: testResult.color,
            author_name: 'Cypress UI Test',
            author_icon: 'https://www.mattermost.org/wp-content/uploads/2016/04/icon.png',
            author_link: 'https://www.mattermost.com',
            title: `Cypress UI Test Automation ${testResult.status}!`,
            fields: [
                {
                    short: false,
                    title: 'Environment',
                    value: `Branch: **${BRANCH}**, Browser: **${BROWSER}**`,
                },
                awsS3Fields,
                {
                    short: false,
                    title: `Key metrics (required support: ${testResult.priority})`,
                    value: statsFieldValue,
                }
            ],
            image_url: 'https://pbs.twimg.com/profile_images/1044345247440896001/pXI1GDHW_bigger.jpg'
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
                value: `Start: **${summary.stats.start}**\nEnd: **${summary.stats.end}**\nUser ID: **${serverInfo.sysadminId}**\nTeam ID: **${serverInfo.ad1TeamId}**`,
            }],
        }],
    };
}

async function getServerInfo(baseUrl) {
    const sysadmin = users.sysadmin;
    const headers = {'X-Requested-With': 'XMLHttpRequest'};

    const loginResponse = await axios({
        method: 'post',
        url: `${baseUrl}/api/v4/users/login`,
        headers,
        data: {login_id: sysadmin.username, password: sysadmin.password},
    });

    let cookieString = '';
    const setCookie = loginResponse.headers['set-cookie'];
    setCookie.forEach((cookie) => {
        const nameAndValue = cookie.split(';')[0];
        cookieString += nameAndValue + ';';
    });

    headers.Cookie = cookieString;

    const teamResponse = await axios({
        method: 'get',
        url: `${baseUrl}/api/v4/teams/name/ad-1`,
        headers,
    });

    return {
        sysadminId: loginResponse.data.id,
        ad1TeamId: teamResponse.data.id,
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
    getServerInfo,
    sendReport,
    writeJsonToFile,
};
