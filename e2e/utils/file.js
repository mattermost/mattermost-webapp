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

    const finalGroupFiles = without(groupFiles, ...excludeGroupFiles);
    const withGroup = group || excludeGroup;

    if (invert) {
        // Return no test file if no stage and withGroup, but inverted
        if (!stage && !withGroup) {
            return [];
        }

        // Return all excluding stage files
        if (stage && !withGroup) {
            return without(allFiles, ...stageFiles);
        }

        // Return all excluding group files
        if (!stage && withGroup) {
            return without(allFiles, ...finalGroupFiles);
        }

        // Return all excluding group and stage files
        return without(allFiles, ...intersection(stageFiles, finalGroupFiles));
    }

    // Return all files if no stage and group flags
    if (!stage && !withGroup) {
        return allFiles;
    }

    // Return stage files if no group flag
    if (stage && !withGroup) {
        return stageFiles;
    }

    // Return group files if no stage flag
    if (!stage && withGroup) {
        return finalGroupFiles;
    }

    // Return files if both in stage and withGroup
    return intersection(stageFiles, finalGroupFiles);
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

module.exports = {
    getTestFiles,
    getSkippedFiles,
};
