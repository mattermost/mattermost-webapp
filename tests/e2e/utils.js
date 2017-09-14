// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import _ from 'lodash';

const Constants = {
    NIGHTWATCH_METHODS: ['tags', 'before', 'after', 'afterEach', 'beforeEach'],
    TEST_BASE_URL: 'localhost:8065',
    USERS: {
        admin: {
            username: 'admin',
            email: 'admin@test.com',
            password: 'passwd'
        },
        test: {
            username: 'test',
            email: 'test@test.com',
            password: 'passwd'
        },
        test2: {
            username: 'test2',
            email: 'test2@test.com',
            password: 'passwd'
        },
        test3: {
            username: 'test3',
            email: 'test3@test.com',
            password: 'passwd'
        },
        test4: {
            username: 'test4',
            email: 'test4@test.com',
            password: 'passwd'
        }
    }
};

function addTestNamePrefixes(config) {
    const prefix = config.tags.join(',');

    return _.mapKeys(config, (value, key) => {
        if (_.includes(Constants.NIGHTWATCH_METHODS, key)) {
            return key;
        }

        return `[${prefix}] ${key}`;
    });
}

export {addTestNamePrefixes, Constants};

const utils = {

    // Method to determine whether to use COMMAND or CONTROL key
    // Based on the operating system. The unicode values are taken from the W3 Webdriver spec:
    // https://www.w3.org/TR/webdriver/#character-types
    cmdOrCtrl() {
        if (process.platform === 'darwin') {
            return '\uE03D';
        }

        return '\uE009';
    },

    testBaseUrl() {
        return Constants.TEST_BASE_URL;
    }
};

export default utils;