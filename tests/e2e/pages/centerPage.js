// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Constants} from '../utils';

const centerCommands = {
    navigateToPage() {
        return this.waitForElementVisible('@postTextBox', Constants.DEFAULT_WAIT);
    },
    postAMessage(message) {
        return this
            .waitForElementVisible('@postTextBox', Constants.DEFAULT_WAIT)
            .setValue('@postTextBox', message)
            .keys(this.Keys.ENTER)
            .waitForElementVisible('@postListContent', Constants.DEFAULT_WAIT);
    }
};

module.exports = {
    url: `${Constants.TEST_BASE_URL}`,
    commands: [centerCommands],
    elements: {
        postTextBox: {
            selector: '//*[@id="post_textbox"]',
            locateStrategy: 'xpath'
        },
        fileAttachmentButton: {
            selector: '//*[@id="create_post"]/div/div[1]/div/span/span[1]/div',
            locateStrategy: 'xpath'
        },
        emojiPickerButton: {
            selector: '//*[@id="create_post"]/div/div[1]/div/span/span[2]/span',
            locateStrategy: 'xpath'
        },
        helpLink: {
            selector: '//*[@id="create_post"]/div/div[1]/div/div/div[3]/a',
            locateStrategy: 'xpath'
        },
        helpText: {
            selector: '//*[@id="create_post"]/div/div[1]/div/div/div[3]/div',
            locateStrategy: 'xpath'
        },
        postListContent: {
            selector: '//*[@id="post-list"]/div[2]/div/div',
            locateStrategy: 'xpath'
        }
    }
};
