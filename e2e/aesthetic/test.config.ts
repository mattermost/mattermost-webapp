// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type TestConfig = {
    baseURL: string;
    adminUsername: string;
    adminPassword: string;
    percyEnabled: boolean;
};

const config: TestConfig = {
    baseURL: process.env.PW_BASE_URL || 'http://localhost:8065',
    adminUsername: process.env.PW_ADMIN_USERNAME || 'sysadmin',
    adminPassword: process.env.PW_ADMIN_PASSWORD || 'Sys@dmin-sample1',
    percyEnabled: Boolean(process.env.PERCY_TOKEN),
};

export default config;
