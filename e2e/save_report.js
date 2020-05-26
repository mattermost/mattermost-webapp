// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-console */

/*
 * This is used for saving artifacts to AWS S3, sending data to automation dashboard and
 * publishing quick summary to community channels.
 *
 * Usage: [ENV] node save_report.js
 *
 * Environment variables:
 *   For saving artifacts to AWS S3
 *      - AWS_S3_BUCKET, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
 *   For saving reports to Automation dashboard
 *      - DASHBOARD_ENABLE, DASHBOARD_ENDPOINT and DASHBOARD_TOKEN
 *   For sending hooks to Mattermost channels
 *      - FULL_REPORT, WEBHOOK_URL and DIAGNOSTIC_WEBHOOK_URL
 *   Test type
 *      - TYPE=[type], e.g. "MASTER", "PR", "RELEASE"
 */

const {merge} = require('mochawesome-merge');
const generator = require('mochawesome-report-generator');

const {
    generateDiagnosticReport,
    generateShortSummary,
    generateTestReport,
    removeOldGeneratedReports,
    sendReport,
    writeJsonToFile,
} = require('./utils/report');
const {saveArtifacts} = require('./utils/artifacts');
const {MOCHAWESOME_REPORT_DIR} = require('./utils/constants');
const {saveDashboard} = require('./utils/dashboard');

require('dotenv').config();

const saveReport = async () => {
    const {
        BRANCH,
        BUILD_ID,
        BUILD_TAG,
        DASHBOARD_ENABLE,
        DIAGNOSTIC_WEBHOOK_URL,
        DIAGNOSTIC_USER_ID,
        DIAGNOSTIC_TEAM_ID,
        TYPE,
        WEBHOOK_URL,
    } = process.env;

    removeOldGeneratedReports();

    // Merge all json reports into one single json report
    const jsonReport = await merge({files: [`${MOCHAWESOME_REPORT_DIR}/**/*.json`]});
    writeJsonToFile(jsonReport, 'all.json', MOCHAWESOME_REPORT_DIR);

    // Generate the html report file
    await generator.create(
        jsonReport,
        {
            reportDir: MOCHAWESOME_REPORT_DIR,
            reportTitle: `Build:${BUILD_ID} Branch: ${BRANCH} Tag: ${BUILD_TAG}`,
        },
    );

    // Generate short summary, write to file and then send report via webhook
    const summary = generateShortSummary(jsonReport);
    console.log(summary);
    writeJsonToFile(summary, 'summary.json', MOCHAWESOME_REPORT_DIR);

    const result = await saveArtifacts();
    if (result && result.success) {
        console.log('Successfully uploaded artifacts to S3:', result.reportLink);
    }

    // Send test report to "QA: UI Test Automation" channel via webhook
    if (TYPE && WEBHOOK_URL) {
        const data = generateTestReport(summary, result && result.success, result && result.reportLink);
        await sendReport('summary report to Community channel', WEBHOOK_URL, data);
    }

    // Send diagnostic report via webhook
    // Send on "RELEASE" type only
    if (TYPE === 'RELEASE' && DIAGNOSTIC_WEBHOOK_URL && DIAGNOSTIC_USER_ID && DIAGNOSTIC_TEAM_ID) {
        const data = generateDiagnosticReport(summary, {userId: DIAGNOSTIC_USER_ID, teamId: DIAGNOSTIC_TEAM_ID});
        await sendReport('test info for diagnostic analysis', DIAGNOSTIC_WEBHOOK_URL, data);
    }

    // Save data to automation dashboard
    if (DASHBOARD_ENABLE === 'true') {
        await saveDashboard(jsonReport, BRANCH);
    }
};

saveReport();
