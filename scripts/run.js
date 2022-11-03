// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-console, no-process-env */

const chalk = require('chalk');
const concurrently = require('concurrently');

const {getWorkspaceCommands} = require('./utils.js');

async function watchAll() {
    console.log(chalk.inverse.bold('Watching web app and all subpackages...') + '\n');

    const commands = [];

    commands.unshift(...getWorkspaceCommands('run'));

    if (process.env.MM_FEATUREFLAGS_BoardsProduct) {
        commands.unshift({command: 'make watch-product', cwd: '../focalboard', name: 'boards', prefixColor: 'red'});
    }

    commands.unshift({command: 'npm:run:webapp', name: 'webapp', prefixColor: 'cyan'});

    const {result} = concurrently(
        commands,
        {
            killOthers: 'failure',
        },
    );
    await result;
}

watchAll();
