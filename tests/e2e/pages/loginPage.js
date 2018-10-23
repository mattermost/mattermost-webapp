// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const loginCommands = {
    navigateToPage() {
        return this.waitForElementVisible('@loginInput');
    },
    login(email, pass) {
        return this.
            waitForElementVisible('@loginInput').
            setValue('@loginInput', email).
            setValue('@passwordInput', pass).
            waitForElementVisible('@signinButton').
            click('@signinButton').
            waitForElementVisible('@appContent');
    },
};

module.exports = {
    url: function() { // eslint-disable-line object-shorthand
        return this.api.launchUrl;
    },
    commands: [loginCommands],
    elements: {
        loginInput: {selector: '#loginId'},
        passwordInput: {selector: '#loginPassword'},
        signinButton: {selector: '#loginButton'},
        appContent: {selector: '#app-content'},
    },
};
