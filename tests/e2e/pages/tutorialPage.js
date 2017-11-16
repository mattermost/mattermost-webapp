// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Constants} from '../utils';

const tutorialCommands = {
    navigateToPage() {
        return this.waitForElementVisible('@appContent', Constants.DEFAULT_WAIT);
    },
    navigateToScreenOne() {
        return this
            .waitForElementVisible('@tutorialIntroCircle0', Constants.DEFAULT_WAIT)
            .click('@tutorialIntroCircle0')
            .waitForElementVisible('@tutorialIntroOne', Constants.DEFAULT_WAIT)
    },
    navigateToScreenTwo() {
        return this
            .waitForElementVisible('@tutorialIntroCircle1', Constants.DEFAULT_WAIT)
            .click('@tutorialIntroCircle1')
            .waitForElementVisible('@appDownloadLink', Constants.DEFAULT_WAIT)
            .waitForElementVisible('@appDownloadImage', Constants.DEFAULT_WAIT)
            .waitForElementVisible('@tutorialIntroTwo', Constants.DEFAULT_WAIT)
    },
    navigateToScreenThree() {
        return this
            .waitForElementVisible('@tutorialIntroCircle2', Constants.DEFAULT_WAIT)
            .click('@tutorialIntroCircle2')
            .waitForElementVisible('@tutorialIntroInvite', Constants.DEFAULT_WAIT)
            .waitForElementVisible('@supportInfo', Constants.DEFAULT_WAIT)
            .waitForElementVisible('@tutorialIntroThree', Constants.DEFAULT_WAIT)
    },
    navigateWithNextButton() {
        return this
            .waitForElementVisible('@tutorialNextButton', Constants.DEFAULT_WAIT)
            .click('@tutorialNextButton')
            .waitForElementVisible('@tutorialNextButton', Constants.DEFAULT_WAIT)
            .click('@tutorialNextButton')
            .waitForElementVisible('@tutorialNextButton', Constants.DEFAULT_WAIT)
            .click('@tutorialNextButton');
    },
    skipTutorial() {
        return this
            .waitForElementVisible('@tutorialSkipLink', Constants.DEFAULT_WAIT)
            .click('@tutorialSkipLink')
    }
};

module.exports = {
    url: `${Constants.TEST_BASE_URL}/login`,
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
        tutorialSkipLink: {selector: '#tutorialSkipLink'}
    },
    sections: {
        postTextboxTipMessage: {
            selector: '#postTextboxTipMessage',
            elements: {
                tipNextButton: {selector: '#tipNextButton'}
            }
        }
    }
};
