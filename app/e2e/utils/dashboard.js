// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-console */

/*
 * Environment:
 *   DASHBOARD_ENDPOINT=[url]
 *   DASHBOARD_TOKEN=[token]
 */

const RPClient = require('reportportal-client');

const {getAllTests} = require('./report');

// See reference: https://github.com/reportportal/client-javascript#starttestitem
const testItemTypes = {
    SUITE: 'SUITE',
    TEST: 'TEST',
};

// See reference: https://github.com/reportportal/client-javascript#finishtestitem
const testItemStatus = {
    PASSED: 'PASSED',
    FAILED: 'FAILED',
    SKIPPED: 'SKIPPED',
};

function saveDashboard(report, branch) {
    const {
        DASHBOARD_ENDPOINT,
        DASHBOARD_TOKEN,
    } = process.env;

    const reporterOptions = {
        endpoint: DASHBOARD_ENDPOINT,
        token: DASHBOARD_TOKEN,
        project: 'Webapp',
        description: 'Mattermost UI Automation with Cypress',
    };

    const rpClient = new RPClient(reporterOptions);

    rpClient.checkConnect().then(() => {
        console.log('You have successfully connected to the automation dashboard server.');
    }, (error) => {
        console.log('Error connecting to automation dashboard server');
        console.dir(error);
    });

    // Start Launch
    const launchObj = rpClient.startLaunch({
        name: `Cypress Test ${branch} branch`,
        startTime: report.stats.start,
        description: `Cypress test report with ${branch} branch`,
    });

    const startDate = new Date(report.stats.start);
    let startTime = 0;

    // Save each Suite and Test
    report.results.forEach((suite, index) => {
        if (index === 0) {
            startTime = startDate.getTime();
        }

        const suiteData = {
            description: suite.fullFile,
            name: suite.suites[0].title,
            startTime,
            type: testItemTypes.SUITE,
        };

        const suiteObj = rpClient.startTestItem(suiteData, launchObj.tempId);
        const tests = getAllTests(suite.suites);
        tests.forEach((test) => {
            let status;
            if (test.pass) {
                status = testItemStatus.PASSED;
            } else if (test.fail) {
                status = testItemStatus.FAILED;
            } else {
                status = testItemStatus.SKIPPED;
            }

            const testData = {
                description: test.title + (test.fail ? test.err.estack : ''),
                name: test.fullTitle,
                startTime,
                type: testItemTypes.TEST,
            };

            const itemObj = rpClient.startTestItem(testData, launchObj.tempId, suiteObj.tempId);
            startTime += test.duration;
            rpClient.finishTestItem(itemObj.tempId, {
                status,
                endTime: startTime,
            });

            if (test.fail) {
                rpClient.sendLog(itemObj.tempId, {
                    level: 'INFO',
                    message: test.err.message,
                    time: startTime,
                });
            }
        });

        rpClient.finishTestItem(suiteObj.tempId, {endTime: startTime});
    });

    const finished = rpClient.finishLaunch(launchObj.tempId, {endTime: startTime});
    return finished.promise.then(() => {
        console.log('Successfully sent automation dashboard data.');
        return {success: true};
    }, (error) => {
        console.log('Encountered error while sending automation dashboard data.', error);
        return {error};
    });
}

module.exports = {saveDashboard};
