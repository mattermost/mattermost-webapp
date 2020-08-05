// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// See reference: https://support.smartbear.com/tm4j-cloud/api-docs/

const axios = require('axios');

const {getAllTests} = require('./report');

const status = {
    passed: 'Pass',
    failed: 'Fail',
    pending: 'Pending',
    skipped: 'Skip',
};

const environment = {
    chrome: 'Chrome',
    firefox: 'Firefox',
};

function getStepStateResult(steps = []) {
    return steps.reduce((acc, item) => {
        if (acc[item.state]) {
            acc[item.state] += 1;
        } else {
            acc[item.state] = 1;
        }

        return acc;
    }, {});
}

function getStepStateSummary(steps = []) {
    const result = getStepStateResult(steps);

    let summary = '';
    Object.entries(result).forEach(([key, value], index) => {
        if (index) {
            summary += ',';
        }
        summary += `${value} ${key}`;
    });

    return summary;
}

function getTM4JTestCases(report) {
    const allTests = getAllTests(report.results);

    const re = /(MM-T)\w+/g;
    return allTests.
        filter((item) => re.test(item.title)).
        map((item) => {
            return {
                title: item.title,
                duration: item.duration,
                incrementalDuration: item.incrementalDuration,
                state: item.state,
                pass: item.pass,
                fail: item.fail,
                pending: item.pending,
            };
        }).
        reduce((acc, item) => {
            const key = item.title.split(' ')[0].split('_')[0];

            if (acc[key]) {
                acc[key].push(item);
            } else {
                acc[key] = [item];
            }

            return acc;
        }, {});
}

function saveToEndpoint(url, data) {
    return axios({
        method: 'POST',
        url,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: process.env.TM4J_API_KEY,
        },
        data,
    }).catch((error) => {
        console.log('Something went wrong:', error.response.data.message); // eslint-disable-line no-console
        return error.response.data;
    });
}

async function createTestCycle(startDate, endDate) {
    const {
        BRANCH,
        BUILD_ID,
        JIRA_PROJECT_KEY,
        TM4J_FOLDER_ID,
    } = process.env;

    const testCycle = {
        projectKey: JIRA_PROJECT_KEY,
        name: `${BUILD_ID}-${BRANCH}`,
        description: `Cypress automated test with ${BRANCH}`,
        plannedStartDate: startDate,
        plannedEndDate: endDate,
        statusName: 'Done',
        folderId: TM4J_FOLDER_ID,
    };

    const response = await saveToEndpoint('https://api.adaptavist.io/tm4j/v2/testcycles', testCycle);
    return response.data;
}

async function createTestExecutions(report, testCycle) {
    const {
        BROWSER,
        JIRA_PROJECT_KEY,
    } = process.env;

    const testCases = getTM4JTestCases(report);
    const startDate = new Date(report.stats.start);
    const startTime = startDate.getTime();

    const promises = [];
    Object.entries(testCases).forEach(([key, value]) => {
        const testScriptResults = value.
            sort((a, b) => a.title.localeCompare(b.title)).
            map((item) => {
                return {
                    statusName: status[item.state],
                    actualEndDate: new Date(startTime + item.incrementalDuration).toISOString(),
                    actualResult: 'Cypress automated test completed',
                };
            });

        const stateResult = getStepStateResult(value);

        const testExecution = {
            projectKey: JIRA_PROJECT_KEY,
            testCaseKey: key,
            testCycleKey: testCycle.key,
            statusName: stateResult.passed && stateResult.passed === value.length ? 'Pass' : 'Fail',
            testScriptResults,
            environmentName: environment[BROWSER] || 'Chrome',
            actualEndDate: testScriptResults[testScriptResults.length - 1].actualEndDate,
            executionTime: value.reduce((acc, prev) => {
                acc += prev.duration; // eslint-disable-line no-param-reassign
                return acc;
            }, 0),
            comment: `Cypress automated test - ${getStepStateSummary(value)}`,
        };

        promises.push(saveToEndpoint('https://api.adaptavist.io/tm4j/v2/testexecutions', testExecution));
    });

    await Promise.all(promises);
    console.log('Successfully saved test cases into the Test Management System'); // eslint-disable-line no-console
}

const saveTestCases = async (allReport) => {
    const {start, end} = allReport.stats;

    const testCycle = await createTestCycle(start, end);

    await createTestExecutions(allReport, testCycle);
};

module.exports = {
    saveTestCases,
};
