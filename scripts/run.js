// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-console, no-process-env */

const fs = require('fs');

const chalk = require('chalk');
const concurrently = require('concurrently');

const {makeRunner} = require('./runner.js');
const {getWorkspaceCommands} = require('./utils.js');

async function watchAll(useRunner) {
    const commands = [];

    commands.unshift(...getWorkspaceCommands('run'));

    if (fs.existsSync('../focalboard')) {
        console.log(chalk.inverse.bold('Focalboard found. Starting Boards product.') + '\n');

        if (!useRunner) {
            commands.unshift({command: 'make watch-product', cwd: '../focalboard', name: 'boards', prefixColor: 'red'});
        }
    } else if (!useRunner) {
        console.log(chalk.inverse.bold('Focalboard not found. Not starting Boards product.') + '\n');
    }

    commands.unshift({command: 'npm:run:webapp', name: 'webapp', prefixColor: 'cyan'});

    let runner;
    if (useRunner) {
        runner = makeRunner(commands);
    }

    if (!useRunner) {
        console.log(chalk.inverse.bold('Watching web app and all subpackages...') + '\n');
    }

    const {result, commands: runningCommands} = concurrently(
        commands,
        {
            killOthers: 'failure',
            outputStream: runner?.getOutputStream(),
        },
    );

    runner?.addCloseListener(() => {
        for (const command of runningCommands) {
            command.kill('SIGINT');
        }
    });

    await result;
}

const useRunner = process.argv[2] === '--runner' || process.env.MM_USE_WEBAPP_RUNNER;

watchAll(useRunner);
