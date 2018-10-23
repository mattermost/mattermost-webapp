// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const centerCommands = {
    navigateToPage() {
        return this.waitForElementVisible('@postTextbox');
    },
    postAMessage(message) {
        return this.
            waitForElementVisible('@postCreateContainer').
            setValue('@postTextbox', message).
            keys(this.Keys.ENTER).
            waitForElementVisible('@postListContent');
    },
};

module.exports = {
    url: function() { // eslint-disable-line object-shorthand
        return this.api.launchUrl;
    },
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
