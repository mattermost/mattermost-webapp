// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Page, ViewportSize} from '@playwright/test';

export type TestArgs = {page: Page; isMobile: boolean; browserName: string; viewport: ViewportSize};

export type TestConfig = {
    baseURL: string;
    adminUsername: string;
    adminPassword: string;
    adminEmail: string;
    applitoolsEnabled: boolean;
    percyEnabled: boolean;
    snapshotEnabled: boolean;
    lessThanCloudUserLimit: boolean;
    resetBeforeTest: boolean;
    haClusterEnabled: boolean;
    haClusterNodeCount: number;
    haClusterName: string;
    branch: string;
    parentBranch: string;
};

const config: TestConfig = {
    baseURL: process.env.PW_BASE_URL || 'http://localhost:8065',
    adminUsername: process.env.PW_ADMIN_USERNAME || 'sysadmin',
    adminPassword: process.env.PW_ADMIN_PASSWORD || 'Sys@dmin-sample1',
    adminEmail: process.env.PW_ADMIN_EMAIL || 'sysadmin@sample.mattermost.com',
    applitoolsEnabled: process.env.PW_APPLITOOLS_ENABLE === 'true',
    percyEnabled: process.env.PW_PERCY_ENABLE === 'true',
    snapshotEnabled: process.env.PW_SNAPSHOT_ENABLE === 'true',
    lessThanCloudUserLimit: process.env.PW_LESS_THAN_CLOUD_USER_LIMIT === 'true',
    resetBeforeTest: process.env.PW_RESET_BEFORE_TEST === 'true',
    haClusterEnabled: process.env.PW_HA_CLUSTER_ENABLED === 'true',
    haClusterNodeCount: parseInt(process.env.PW_HA_CLUSTER_NODE_COUNT, 10) || 3,
    haClusterName: process.env.PW_HA_CLUSTER_NAME || 'mm_dev_cluster',
    branch: process.env.PW_BRANCH || 'master',
    parentBranch: process.env.PW_PARENT_BRANCH || 'master',
};

export default config;
