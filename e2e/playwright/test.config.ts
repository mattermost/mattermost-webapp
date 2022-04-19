// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type TestConfig = {
    baseURL: string;
    adminUsername: string;
    adminPassword: string;
    adminEmail: string;
    applitoolsEnabled: boolean;
    percyEnabled: boolean;
    lessThanCloudUserLimit: boolean;
    resetBeforeTest: boolean;
};

const config: TestConfig = {
    baseURL: process.env.PW_BASE_URL || 'http://localhost:8065',
    adminUsername: process.env.PW_ADMIN_USERNAME || 'sysadmin',
    adminPassword: process.env.PW_ADMIN_PASSWORD || 'Sys@dmin-sample1',
    adminEmail: process.env.PW_ADMIN_EMAIL || 'sysadmin@sample.mattermost.com',
    applitoolsEnabled: process.env.APPLITOOLS_ENABLE === 'true',
    percyEnabled: process.env.PERCY_ENABLE === 'true',
    lessThanCloudUserLimit: process.env.LESS_THAN_CLOUD_USER_LIMIT === 'true',
    resetBeforeTest: process.env.RESET_BEFORE_TEST === 'true',
};

export default config;
