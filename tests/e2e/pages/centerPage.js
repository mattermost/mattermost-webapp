// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Constants} from '../utils';

const centerCommands = {
    navigateToPage() {
        return this.waitForElementVisible('@postTextbox', Constants.DEFAULT_WAIT);
    },
    postAMessage(message) {
        return this.
            waitForElementVisible('@postCreateContainer', Constants.DEFAULT_WAIT).
            setValue('@postTextbox', message).
            keys(this.Keys.ENTER).
            waitForElementVisible('@postListContent', Constants.DEFAULT_WAIT);
    },
};

module.exports = {
    url: `${Constants.TEST_BASE_URL}`,
    commands: [centerCommands],
    sections: {
        postList: {
            selector: '#post-list',
            elements: {
                postListContent: {selector: '#postListContent'},
                channelIntro: {selector: '#channelIntro'},
            },
        },
        postCreate: {
            selector: '#post-create',
            elements: {
                postTextbox: {selector: '#post_textbox'},
                fileUploadButton: {selector: '#fileUploadButton'},
                emojiPickerButton: {selector: '#emojiPickerButton'},
                helpTextContainer: {selector: '#helpTextContainer'},
                helpTextLink: {selector: '#helpTextLink'},
                helpText: {selector: '#helpText'},
                previewLink: {selector: '#previewLink'},
                postCreateFooter: {selector: '#postCreateFooter'},
            },
        },
    },
};
