// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-await-in-loop */

const cypress = require('cypress');
const fse = require('fs-extra');
const {merge} = require('mochawesome-merge');
const generator = require('mochawesome-report-generator');

async function runTests() {
    await fse.remove('results');
    await fse.remove('screenshots');

    const testDirs = fse.readdirSync('cypress/integration/');
    let totalFailed = 0;

    const mochawesomeReportDir = 'results/mochawesome-report';

    for (const dir of testDirs) {
        const {failed} = await cypress.run({
            spec: `./cypress/integration/${dir}/**/*`,
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
                        reportFilename: `mochawesome-${dir}`,
                        quiet: true,
                        overwrite: false,
                        html: false,
                        json: true,
                    },
                },
        });

        totalFailed += failed;
    }

    // Merge all json reports into one single json report
    const jsonReport = await merge({reportDir: mochawesomeReportDir});

    // Generate the html report file
    await generator.create(jsonReport, {reportDir: mochawesomeReportDir});

    // eslint-disable-next-line
    process.exit(totalFailed); // exit with the number of failed tests
}

runTests();