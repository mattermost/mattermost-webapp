// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-console */

/*
 * Environment:
 *   AUTOMATION_DASHBOARD_URL=[url]
 *   AUTOMATION_DASHBOARD_TOKEN=[token]
 */

import fs from 'fs';

import readFileNonPromise from 'util';
const readFile = readFileNonPromise.promisify(fs.readFile);

import axios from 'axios';
import axiosRetry from 'axios-retry';
import chalk from 'chalk';
import mime from 'mime-types';

import {SortedFile} from './file';

require('dotenv').config();

const maxRetry = 5;
const timeout = 10 * 1000;

axiosRetry(axios, {
    retries: maxRetry,
    retryDelay: axiosRetry.exponentialDelay,
});

const {
    AUTOMATION_DASHBOARD_URL,
    AUTOMATION_DASHBOARD_TOKEN,
} = process.env;

const connectionErrors = ['ECONNABORTED', 'ECONNREFUSED'];

interface Screenshot {
    url: string;
    taken_at: string;
    height: number;
    width: number;
}

export interface TestResult {
    title: string;
    full_title: string;
    state: string;
    duration: number;
    code: string;
    test_started_at?: number;
    error_display?: string;
    error_frame?: string;
    screenshot?: Screenshot;
}

interface CreateStartCycleArg {
    repo: string;
    branch: string;
    build: string;
    files: SortedFile[];
}

export async function createAndStartCycle(data: CreateStartCycleArg): Promise<{cycle: any}> {
    const response = await axios({
        url: `${AUTOMATION_DASHBOARD_URL}/cycles/start`,
        headers: {
            Authorization: `Bearer ${AUTOMATION_DASHBOARD_TOKEN}`,
        },
        method: 'post',
        timeout,
        data,
    });

    return response.data;
}

export async function getSpecToTest({repo, branch, build, server}) {
    try {
        const response = await axios({
            url: `${AUTOMATION_DASHBOARD_URL}/executions/specs/start?repo=${repo}&branch=${branch}&build=${build}`,
            headers: {
                Authorization: `Bearer ${AUTOMATION_DASHBOARD_TOKEN}`,
            },
            method: 'post',
            timeout,
            data: {server},
        });

        return response.data;
    } catch (err) {
        console.log(chalk.red('Failed to get spec to test'));
        if (connectionErrors.includes(err.code) || !err.response) {
            console.log(chalk.red(`Error code: ${err.code}`));
            return {code: err.code};
        }

        return err.response && err.response.data;
    }
}

export async function recordSpecResult(specId: string, spec: any, tests: TestResult[]) {
    try {
        const response = await axios({
            url: `${AUTOMATION_DASHBOARD_URL}/executions/specs/end?id=${specId}`,
            headers: {
                Authorization: `Bearer ${AUTOMATION_DASHBOARD_TOKEN}`,
            },
            method: 'post',
            timeout,
            data: {spec, tests},
        });

        console.log(chalk.green('Successfully recorded!'));
        return response.data;
    } catch (err) {
        console.log(chalk.red('Failed to record spec result'));
        if (connectionErrors.includes(err.code) || !err.response) {
            console.log(chalk.red(`Error code: ${err.code}`));
            return {code: err.code};
        }

        return err.response && err.response.data;
    }
}

export async function updateCycle(id: string, cyclePatch: any) {
    try {
        const response = await axios({
            url: `${AUTOMATION_DASHBOARD_URL}/cycles/${id}`,
            headers: {
                Authorization: `Bearer ${AUTOMATION_DASHBOARD_TOKEN}`,
            },
            method: 'put',
            timeout,
            data: cyclePatch,
        });

        console.log(chalk.green('Successfully updated the cycle with test environment data!'));
        return response.data;
    } catch (err) {
        console.log(chalk.red('Failed to update cycle'));
        if (connectionErrors.includes(err.code) || !err.response) {
            console.log(chalk.red(`Error code: ${err.code}`));
            return {code: err.code};
        }

        return err.response && err.response.data;
    }
}

export async function uploadScreenshot(filePath: string, repo: any, branch: string, build: any) {
    try {
        const contentType = mime.lookup(filePath);
        const extension = mime.extension(contentType || '');

        const {data}: {data: {upload_url: string; object_url: string}} = await axios({
            url: `${AUTOMATION_DASHBOARD_URL}/upload-request`,
            headers: {
                Authorization: `Bearer ${AUTOMATION_DASHBOARD_TOKEN}`,
            },
            method: 'get',
            timeout,
            data: {repo, branch, build, extension},
        });

        const file = await readFile(filePath);

        await (axios as any)({
            url: data.upload_url,
            method: 'put',
            headers: {'Content-Type': contentType},
            data: file,
        });

        return data.object_url;
    } catch (err) {
        if (connectionErrors.includes(err.code) || !err.response) {
            console.log(chalk.red(`Error code: ${err.code}`));
            return {code: err.code};
        }

        return err.response && err.response.data;
    }
}
