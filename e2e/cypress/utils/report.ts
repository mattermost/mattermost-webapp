// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-console, camelcase */

import axios, {Method} from 'axios';
import fse from 'fs-extra';

import {MOCHAWESOME_REPORT_DIR} from './constants';

const MAX_FAILED_TITLES = 5;

let incrementalDuration = 0;

export interface Test {
    duration: number; 
    title: string;
    incrementalDuration: number;
    state: string;
    pass: boolean;
    fail: boolean;
    pending: boolean;
}

export interface Results {
    tests: Test[]
    suites: Results[]
}

interface Stats {
    passPercent: number;
    duration: number;
    suites: number;
    tests: number;
    passes: number;
    failures: number;
    skipped: number;
    start: string;
    end: string;
}

export interface Report {
    results: Results[];
    stats: Stats;
}

export function getAllTests(results: Results[]) {
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

function generateStatsFieldValue(stats: Stats, failedFullTitles: string[]) {
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
    let failedTests: string | undefined;
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

export function generateShortSummary(report: Report) {
    const {results, stats} = report;
    const tests = getAllTests(results);

    const failedFullTitles = tests.filter((t) => t.fail).map((t) => t.fullTitle);
    const statsFieldValue = generateStatsFieldValue(stats, failedFullTitles);

    return {
        stats,
        statsFieldValue,
    };
}

export function removeOldGeneratedReports() {
    [
        'all.json',
        'summary.json',
        'mochawesome.html',
    ].forEach((file) => fse.removeSync(`${MOCHAWESOME_REPORT_DIR}/${file}`));
}

export function writeJsonToFile(jsonObject: any, filename: string, dir: string) {
    fse.writeJson(`${dir}/${filename}`, jsonObject).
        then(() => console.log('Successfully written:', filename)).
        catch((err) => console.error(err));
}

export function readJsonFromFile(file: string) {
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

interface Summary {
    stats: Stats;
    statsFieldValue: string;
}

interface Environment {
    cypress_version: string;
    browser_name: string;
    browser_version: string;
    headless: boolean;
    os_name: string;
    os_version: string;
    node_version: string;
}

interface TestResult {
    color: string;
    priority: string;
}

interface AttachmentField {
    short: boolean;
    title: string;
    value: string;
}

export function generateTestReport(summary: Summary, isUploadedToS3: boolean, reportLink: string, environment: Environment, testCycleKey: string) {
    const {
        FULL_REPORT,
        TEST_CYCLE_LINK_PREFIX,
    } = process.env;
    const {statsFieldValue, stats} = summary;
    const {
        cypress_version,
        browser_name,
        browser_version,
        headless,
        os_name,
        os_version,
        node_version,
    } = environment;

    let testResult: TestResult;
    for (let i = 0; i < result.length; i++) {
        if (stats.passPercent >= result[i].cutOff) {
            testResult = result[i];
            break;
        }
    }

    const title = generateTitle();
    const envValue = `cypress@${cypress_version} | node@${node_version} | ${browser_name}@${browser_version}${headless ? ' (headless)' : ''} | ${os_name}@${os_version}`;

    if (FULL_REPORT === 'true') {
        let reportField: AttachmentField;
        if (isUploadedToS3) {
            reportField = {
                short: false,
                title: 'Test Report',
                value: `[Link to the report](${reportLink})`,
            };
        }

        let testCycleField: AttachmentField;
        if (testCycleKey) {
            testCycleField = {
                short: false,
                title: 'Test Execution',
                value: `[Recorded test executions](${TEST_CYCLE_LINK_PREFIX}${testCycleKey})`,
            };
        }

        return {
            username: 'Cypress UI Test',
            icon_url: 'https://mattermost.com/wp-content/uploads/2022/02/icon_WS.png',
            attachments: [{
                color: testResult.color,
                author_name: 'Webapp End-to-end Testing',
                author_icon: 'https://mattermost.com/wp-content/uploads/2022/02/icon_WS.png',
                author_link: 'https://www.mattermost.com',
                title,
                fields: [
                    {
                        short: false,
                        title: 'Environment',
                        value: envValue,
                    },
                    reportField,
                    testCycleField,
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

    let testCycleLink = '';
    if (testCycleKey) {
        testCycleLink = testCycleKey ? `| [Recorded test executions](${TEST_CYCLE_LINK_PREFIX}${testCycleKey})` : '';
    }

    return {
        username: 'Cypress UI Test',
        icon_url: 'https://mattermost.com/wp-content/uploads/2022/02/icon_WS.png',
        attachments: [{
            color: testResult.color,
            author_name: 'Webapp End-to-end Testing',
            author_icon: 'https://mattermost.com/wp-content/uploads/2022/02/icon_WS.png',
            author_link: 'https://www.mattermost.com/',
            title,
            text: `${quickSummary} | ${(stats.duration / (60 * 1000)).toFixed(2)} mins ${testCycleLink}\n${envValue}`,
        }],
    };
}

function generateTitle() {
    const {
        BRANCH,
        MM_DOCKER_IMAGE,
        MM_DOCKER_TAG,
        PULL_REQUEST,
        RELEASE_DATE,
        TYPE,
    } = process.env;

    let dockerImageLink = '';
    if (MM_DOCKER_IMAGE && MM_DOCKER_TAG) {
        dockerImageLink = ` with [${MM_DOCKER_IMAGE}:${MM_DOCKER_TAG}](https://hub.docker.com/r/mattermost/${MM_DOCKER_IMAGE}/tags?name=${MM_DOCKER_TAG})`;
    }

    let releaseDate = '';
    if (RELEASE_DATE) {
        releaseDate = ` for ${RELEASE_DATE}`;
    }

    let title: string;

    switch (TYPE) {
    case 'PR':
        title = `E2E for Pull Request Build: [${BRANCH}](${PULL_REQUEST})${dockerImageLink}`;
        break;
    case 'RELEASE':
        title = `E2E for Release Build${dockerImageLink}${releaseDate}`;
        break;
    case 'MASTER':
        title = `E2E for Master Nightly Build (Prod tests)${dockerImageLink}`;
        break;
    case 'MASTER_UNSTABLE':
        title = `E2E for Master Nightly Build (Unstable tests)${dockerImageLink}`;
        break;
    case 'CLOUD':
        title = `E2E for Cloud Build (Prod tests)${dockerImageLink}${releaseDate}`;
        break;
    case 'CLOUD_UNSTABLE':
        title = `E2E for Cloud Build (Unstable tests)${dockerImageLink}`;
        break;
    default:
        title = `E2E for Build${dockerImageLink}`;
    }

    return title;
}

interface ServerInfo {
    userId: string;
    teamId: string;
}

interface DiagnosticSummary {
    stats: {
        start: string;
        end: string;
    }
}

export function generateDiagnosticReport(summary: DiagnosticSummary, serverInfo: ServerInfo) {
    const {BRANCH, BUILD_ID} = process.env;

    return {
        username: 'Cypress UI Test',
        icon_url: 'https://mattermost.com/wp-content/uploads/2022/02/icon_WS.png',
        attachments: [{
            color: '#43A047',
            author_name: 'Cypress UI Test',
            author_icon: 'https://mattermost.com/wp-content/uploads/2022/02/icon_WS.png',
            author_link: 'https://community.mattermost.com/core/channels/ui-test-automation',
            title: `Cypress UI Test Automation #${BUILD_ID}, **${BRANCH}** branch`,
            fields: [{
                short: false,
                value: `Start: **${summary.stats.start}**\nEnd: **${summary.stats.end}**\nUser ID: **${serverInfo.userId}**\nTeam ID: **${serverInfo.teamId}**`,
            }],
        }],
    };
}

export async function sendReport(name: string, url: string, data: any) {
    const requestOptions = {method: 'POST' as Method, url, data};

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
