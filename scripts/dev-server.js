// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-console */

const chalk = require('chalk');
const concurrently = require('concurrently');

const {getWorkspaceCommands} = require('./utils.js');

async function watchAllWithDevServer() {
    console.log(chalk.inverse.bold('Watching web app and all subpackages...') + '\n');

    const {result} = concurrently(
        [
            {command: 'npm:dev-server:webapp', name: 'webapp', prefixColor: 'cyan'},
            ...getWorkspaceCommands('run'),
        ],
        {
            killOthers: 'failure',
        },
    );
    await result;
}

watchAllWithDevServer();
