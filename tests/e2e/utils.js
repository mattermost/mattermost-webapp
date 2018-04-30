// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export const Constants = {
    TEST_BASE_URL: 'http://localhost:8065',
    DEFAULT_WAIT: 20000,
    USERS: {
        admin: {
            username: 'admin',
            email: 'admin@test.com',
            password: 'passwd',
        },
        test: {
            username: 'test',
            email: 'test@test.com',
            password: 'passwd',
        },
        test2: {
            username: 'test2',
            email: 'test2@test.com',
            password: 'passwd',
        },
        test3: {
            username: 'test3',
            email: 'test3@test.com',
            password: 'passwd',
        },
        test4: {
            username: 'test4',
            email: 'test4@test.com',
            password: 'passwd',
        },
    },
};

export const utils = {
    cmdOrCtrl() {
        if (process.platform === 'darwin') {
            return '\uE03D';
        }

        return '\uE009';
    },
    testBaseUrl() {
        return Constants.TEST_BASE_URL;
    },
};

export default utils;
