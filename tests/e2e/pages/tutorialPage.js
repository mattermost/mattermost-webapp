// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Constants} from '../utils';

const tutorialCommands = {
    navigateToPage() {
        return this.waitForElementVisible('@appContent', Constants.DEFAULT_WAIT);
    },
    nextTutorial() {
        return this
            .waitForElementVisible('@tutorialNextButton', Constants.DEFAULT_WAIT)
            .click('@tutorialNextButton')
            .waitForElementVisible('@tutorialNextButton', Constants.DEFAULT_WAIT)
            .click('@tutorialNextButton')
            .waitForElementVisible('@tutorialNextButton', Constants.DEFAULT_WAIT)
            .click('@tutorialNextButton')
            .waitForElementVisible('@tipButton', Constants.DEFAULT_WAIT)
            .click('@tipButton')
            .waitForElementVisible('@tipNextButton', Constants.DEFAULT_WAIT)
            .click('@tipNextButton')
            .waitForElementVisible('@tipButton', Constants.DEFAULT_WAIT)
            .click('@tipButton')
            .waitForElementVisible('@tipNextButton', Constants.DEFAULT_WAIT)
            .click('@tipNextButton')
            .waitForElementVisible('@tipNextButton', Constants.DEFAULT_WAIT)
            .click('@tipNextButton')
            .waitForElementVisible('@tipNextButton', Constants.DEFAULT_WAIT)
            .click('@tipNextButton')
            .waitForElementVisible('@tipButton', Constants.DEFAULT_WAIT)
            .click('@tipButton')
            .waitForElementVisible('@tipNextButton', Constants.DEFAULT_WAIT)
            .click('@tipNextButton')
    },
    skipTutorial() {
        return this
            .waitForElementVisible('@tutorialSkipButton', Constants.DEFAULT_WAIT)
            .click('@tutorialSkipButton')
    }
};

module.exports = {
    url: `${Constants.TEST_BASE_URL}/login`,
    commands: [tutorialCommands],
    elements: {
        appContent: {selector: '#app-content'},
        tutorialNextButton: {selector: '#tutorialNextButton'},
        tutorialSkipLink: {selector: '#tutorialSkipLink'},
        tipButton: {selector: '#tipButton'},
        tipNextButton: {selector: '#tipNextButton'}
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
