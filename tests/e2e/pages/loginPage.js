// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Constants} from '../utils';

const loginCommands = {
    navigateToPage() {
        return this.waitForElementVisible('@loginInput', Constants.DEFAULT_WAIT);
    },
    login(email, pass) {
        return this
            .waitForElementVisible('@loginInput', Constants.DEFAULT_WAIT)
            .setValue('@loginInput', email)
            .setValue('@passwordInput', pass)
            .waitForElementVisible('@signinButton', Constants.DEFAULT_WAIT)
            .click('@signinButton')
            .waitForElementVisible('@appContent', Constants.DEFAULT_WAIT);
    }
};

module.exports = {
    url: `${Constants.TEST_BASE_URL}/login`,
    commands: [loginCommands],
    elements: {
        loginInput: {selector: '#loginId'},
        passwordInput: {selector: '#loginPassword'},
        signinButton: {selector: '#loginButton'},
        appContent: {selector: '#app-content'}
    }
};
