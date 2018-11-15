// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const channelHeaderDropdownCommands = {
    navigateToPage() {
        return this.waitForElementVisible('@channelHeaderDropdownMenu');
    },
};

module.exports = {
    url: function() { // eslint-disable-line object-shorthand
        return this.api.launchUrl;
    },
    commands: [channelHeaderDropdownCommands],
    sections: {
        channelHeaderDropdownMenu: {
            selector: '#channelHeaderDropdownMenu',
            elements: {
                channelViewInfo: {selector: '#channelViewInfo'},
                channelManageMembers: {selector: '#channelManageMembers'},
                channelNotificationsGroup: {selector: '#channelNotificationsGroup'},
                channelMute: {selector: '#channelMute'},
                channelUnmute: {selector: '#channelUnmute'},
                channelEditHeader: {selector: '#channelEditHeader'},
                channelEditPurpose: {selector: '#channelEditPurpose'},
                channelRename: {selector: '#channelRename'},
            },
        },
    },
};
