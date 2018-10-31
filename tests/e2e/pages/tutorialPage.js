// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const tutorialCommands = {
    navigateToPage() {
        return this.waitForElementVisible('@appContent');
    },
    navigateToScreenOne() {
        return this.
            waitForElementVisible('@tutorialIntroCircle0').
            click('@tutorialIntroCircle0').
            waitForElementVisible('@tutorialIntroOne');
    },
    navigateToScreenTwo() {
        return this.
            waitForElementVisible('@tutorialIntroCircle1').
            click('@tutorialIntroCircle1').
            waitForElementVisible('@appDownloadLink').
            waitForElementVisible('@appDownloadImage').
            waitForElementVisible('@tutorialIntroTwo');
    },
    navigateToScreenThree() {
        return this.
            waitForElementVisible('@tutorialIntroCircle2').
            click('@tutorialIntroCircle2').
            waitForElementVisible('@tutorialIntroInvite').
            waitForElementVisible('@supportInfo').
            waitForElementVisible('@tutorialIntroThree');
    },
    navigateWithNextButton() {
        return this.
            waitForElementVisible('@tutorialNextButton').
            click('@tutorialNextButton').
            waitForElementVisible('@tutorialNextButton').
            click('@tutorialNextButton').
            waitForElementVisible('@tutorialNextButton').
            click('@tutorialNextButton');
    },
    skipTutorial() {
        return this.
            waitForElementVisible('@tutorialSkipLink').
            click('@tutorialSkipLink');
    },
};

module.exports = {
    url: function() { // eslint-disable-line object-shorthand
        return this.api.launchUrl;
    },
    commands: [tutorialCommands],
    elements: {
        appContent: {selector: '#app-content'},
        tutorialIntroContent: {selector: '#tutorialIntroContent'},
        tutorialIntroOne: {selector: '#tutorialIntroOne'},
        tutorialIntroTwo: {selector: '#tutorialIntroTwo'},
        appDownloadLink: {selector: '#appDownloadLink'},
        appDownloadImage: {selector: '#appDownloadImage'},
        tutorialIntroThree: {selector: '#tutorialIntroThree'},
        tutorialIntroInvite: {selector: '#tutorialIntroInvite'},
        supportInfo: {selector: '#supportInfo'},
        tutorialIntroCircle0: {selector: '#tutorialIntroCircle0'},
        tutorialIntroCircle1: {selector: '#tutorialIntroCircle1'},
        tutorialIntroCircle2: {selector: '#tutorialIntroCircle2'},
        tutorialNextButton: {selector: '#tutorialNextButton'},
        tutorialSkipLink: {selector: '#tutorialSkipLink'},
    },
    sections: {
        postTextboxTipMessage: {
            selector: '#postTextboxTipMessage',
            elements: {
                tipNextButton: {selector: '#tipNextButton'},
            },
        },
    },
};
