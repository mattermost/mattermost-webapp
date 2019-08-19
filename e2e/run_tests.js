// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-await-in-loop, no-console */

const cypress = require('cypress');
const fse = require('fs-extra');
const {merge} = require('mochawesome-merge');
const generator = require('mochawesome-report-generator');

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
        then(() => console.log('Success!')).
        catch((err) => console.error(err));
}

async function runTests() {
    await fse.remove('results');
    await fse.remove('screenshots');

    const testDirs = fse.readdirSync('cypress/integration/');
    let failedTests = 0;

    const mochawesomeReportDir = 'results/mochawesome-report';

    for (const dir of testDirs) {
        const {totalFailed} = await cypress.run({
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

        failedTests += totalFailed;
    }

    // Merge all json reports into one single json report
    const jsonReport = await merge({reportDir: mochawesomeReportDir});

    // Generate short summary to easily pickup via hook
    const summary = generateShortSummary(jsonReport);
    writeJsonToFile(summary, 'summary.json', mochawesomeReportDir);

    // Generate the html report file
    await generator.create(jsonReport, {reportDir: mochawesomeReportDir});

    // eslint-disable-next-line
    process.exit(failedTests); // exit with the number of failed tests
}

runTests();
