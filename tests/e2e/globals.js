// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const testUsers = {
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
};

module.exports = {

    // this controls whether to abort the test execution when an assertion failed and skip the rest
    // it's being used in waitFor commands and expect assertions
    abortOnAssertionFailure: true,

    // this will overwrite the default polling interval (currently 500ms) for waitFor commands
    // and expect assertions that use retry
    waitForConditionPollInterval: 300,

    // default timeout value in milliseconds for waitFor commands and implicit waitFor value for
    // expect assertions
    waitForConditionTimeout: 20000,

    // this will cause waitFor commands on elements to throw an error if multiple
    // elements are found using the given locate strategy and selector
    throwOnMultipleElementsReturned: true,

    // controls the timeout time for async hooks. Expects the done() callback to be invoked within this time
    // or an error is thrown
    asyncHookTimeout: 10000,

    default: {
        myGlobal() {
            return '';
        },
    },

    test_env: {
        myGlobal: 'test_global',
        beforeEach() {},
    },

    before(cb) {
        cb();
    },

    beforeEach(browser, cb) {
        browser.resizeWindow(1920, 1080, cb);
    },

    after(cb) {
        cb();
    },

    afterEach(browser, cb) {
        cb();
    },

    reporter(results, cb) {
        cb();
    },

    testUsers,

    cmdOrCtrl: () => {
        if (process.platform === 'darwin') {
            return '\uE03D';
        }

        return '\uE009';
    },
};
