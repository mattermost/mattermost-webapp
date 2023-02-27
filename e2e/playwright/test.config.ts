// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Page, ViewportSize} from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

export type TestArgs = {
    page: Page;
    isMobile?: boolean;
    browserName: string;
    viewport?: ViewportSize | null;
};

export type TestConfig = {
    // Server
    baseURL: string;
    adminUsername: string;
    adminPassword: string;
    adminEmail: string;
    lessThanCloudUserLimit: boolean;
    resetBeforeTest: boolean;
    haClusterEnabled: boolean;
    haClusterNodeCount: number;
    haClusterName: string;
    // CI
    isCI: boolean;
    // Playwright
    headless: boolean;
    workers: number;
    // Visual tests
    snapshotEnabled: boolean;
    percyEnabled: boolean;
    percyToken?: string;
};

// All process.env should be defined here
const config: TestConfig = {
    // Server
    baseURL: process.env.PW_BASE_URL || 'http://localhost:8065',
    adminUsername: process.env.PW_ADMIN_USERNAME || 'sysadmin',
    adminPassword: process.env.PW_ADMIN_PASSWORD || 'Sys@dmin-sample1',
    adminEmail: process.env.PW_ADMIN_EMAIL || 'sysadmin@sample.mattermost.com',
    lessThanCloudUserLimit: process.env.PW_LESS_THAN_CLOUD_USER_LIMIT === 'true',
    haClusterEnabled: process.env.PW_HA_CLUSTER_ENABLED === 'true',
    haClusterNodeCount: process.env.PW_HA_CLUSTER_NODE_COUNT ? parseInt(process.env.PW_HA_CLUSTER_NODE_COUNT, 10) : 3,
    haClusterName: process.env.PW_HA_CLUSTER_NAME || 'mm_dev_cluster',
    resetBeforeTest: process.env.PW_RESET_BEFORE_TEST === 'true',
    // CI
    isCI: !!process.env.CI,
    // Playwright
    headless: process.env.PW_HEADLESS === 'true',
    workers: process.env.PW_WORKERS ? parseInt(process.env.PW_WORKERS, 10) : 1,
    // Visual tests
    snapshotEnabled: process.env.PW_SNAPSHOT_ENABLE === 'true',
    percyEnabled: process.env.PW_PERCY_ENABLE === 'true',
    percyToken: process.env.PERCY_TOKEN,
};

export default config;
