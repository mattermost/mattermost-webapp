// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-console */

const chalk = require('chalk');
const intersection = require('lodash.intersection');
const without = require('lodash.without');
const shell = require('shelljs');
const argv = require('yargs').argv;

const TEST_DIR = 'cypress/integration';

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
    const {invert, excludeGroup, group, stage} = argv;

    const allFiles = grepFiles(grepCommand());

    let stageFiles = allFiles;
    if (stage) {
        const sc = grepCommand(stage.split(',').join('\\|'));
        stageFiles = grepFiles(sc);
    }

    let groupFiles = [...stageFiles];
    if (group) {
        const gc = grepCommand(group.split(',').join('\\|'));
        groupFiles = grepFiles(gc);
    }

    const excludeGroupFiles = [];
    if (excludeGroup) {
        const egc = grepCommand(excludeGroup.split(',').join('\\|'));
        excludeGroupFiles.push(...grepFiles(egc));
    }

    if (invert) {
        // Return no test file if no stage and withGroup, but inverted
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

function getWeightedFiles(metadata, sortFirst = true) {
    let weightedFiles = [];
    if (metadata) {
        metadata.split(',').forEach((word, i, arr) => {
            const sl = grepCommand(word);
            const files = grepFiles(sl).map((file) => {
                return {
                    file,
                    sortWeight: sortFirst ? (i - arr.length) : (i + 1),
                };
            });
            weightedFiles.push(...files);
        });
    }

    if (sortFirst) {
        weightedFiles = weightedFiles.reverse();
    }

    return weightedFiles.reduce((acc, f) => {
        acc[f.file] = f;
        return acc;
    }, {});
}

function getSortedTestFiles(platform, browser, headless) {
    // Get all test files
    const testFilesObject = getTestFiles().reduce((acc, file) => {
        acc[file] = {file, sortWeight: 0};
        return acc;
    }, {});

    // Get files to be sorted first
    const firstFilesObject = getWeightedFiles(argv.sortFirst, true);
    const validFirstFiles = intersection(Object.keys(testFilesObject), Object.keys(firstFilesObject));
    Object.entries(firstFilesObject).forEach(([k, v]) => {
        if (validFirstFiles.includes(k)) {
            testFilesObject[k] = v;
        }
    });

    // Get files to be sorted last
    const lastFilesObject = getWeightedFiles(argv.sortLast, false);
    const validLastFiles = intersection(Object.keys(testFilesObject), Object.keys(lastFilesObject));
    Object.entries(lastFilesObject).forEach(([k, v]) => {
        if (validLastFiles.includes(k)) {
            testFilesObject[k] = v;
        }
    });

    // Remove skipped files
    const initialSkippedFiles = getSkippedFiles(platform, browser, headless);
    const skippedFiles = intersection(Object.keys(testFilesObject), initialSkippedFiles);
    if (skippedFiles.length) {
        printSkippedFiles(skippedFiles, platform, browser, headless);

        skippedFiles.forEach((file) => {
            if (testFilesObject.hasOwnProperty(file)) {
                delete testFilesObject[file];
            }
        });
    }

    // Remove excluded files
    const initialExcludedFiles = getExcludedFiles(argv.excludeGroup);
    const excludedFiles = intersection(Object.keys(testFilesObject), initialExcludedFiles);
    if (excludedFiles.length) {
        printExcludedFiles(excludedFiles, argv.excludeGroup);

        excludedFiles.forEach((file) => {
            if (testFilesObject.hasOwnProperty(file)) {
                delete testFilesObject[file];
            }
        });
    }

    const sortedFiles = Object.values(testFilesObject).
        sort((a, b) => {
            if (a.sortWeight > b.sortWeight) {
                return 1;
            } else if (a.sortWeight < b.sortWeight) {
                return -1;
            }

            return a.file.localeCompare(b.file);
        }).
        map((sortedObj) => sortedObj.file);

    return {sortedFiles, skippedFiles, weightedTestFiles: Object.values(testFilesObject)};
}

function getExcludedFiles(excludeGroup) {
    if (!excludeGroup) {
        return [];
    }

    const egc = grepCommand(excludeGroup.split(',').join('\\|'));
    return grepFiles(egc);
}

function printExcludedFiles(excludedFiles = [], excludeGroup) {
    console.log(chalk.cyan(`\nExcluded test files due to "${excludeGroup}":`));

    excludedFiles.forEach((file, index) => {
        console.log(chalk.cyan(`- [${index + 1}] ${file}`));
    });
    console.log('');
}

function getSkippedFiles(platform, browser, headless) {
    const platformFiles = grepFiles(grepCommand(`@${platform}`));
    const browserFiles = grepFiles(grepCommand(`@${browser}`));
    const headlessFiles = grepFiles(grepCommand(`@${headless ? 'headless' : 'headed'}`));

    return platformFiles.concat(browserFiles, headlessFiles);
}

function printSkippedFiles(skippedFiles = [], platform, browser, headless) {
    console.log(chalk.cyan(`\nSkipped test files due to ${platform}/${browser} (${headless ? 'headless' : 'headed'}):`));

    skippedFiles.forEach((file, index) => {
        console.log(chalk.cyan(`- [${index + 1}] ${file}`));
    });
    console.log('');
}

module.exports = {
    getSortedTestFiles,
};
