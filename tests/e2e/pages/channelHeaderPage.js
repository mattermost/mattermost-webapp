// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const centerChannelHeaderCommands = {
    navigateToPage() {
        return this.waitForElementVisible('@headerContainer');
    },
};

module.exports = {
    url: function() { // eslint-disable-line object-shorthand
        return this.api.launchUrl;
    },
    commands: [centerChannelHeaderCommands],
    sections: {
        channelHeader: {
            selector: '#channel-header',
            sections: {
                channelHeaderInfo: {
                    selector: '#channelHeaderInfo',
                    elements: {
                        toggleFavorite: {selector: '#toggleFavorite'},
                        channelHeaderTitle: {selector: '#channelHeaderTitle'},
                        channelHeaderDescription: {selector: '#channelHeaderDescription'},
                        channelHeaderDropdownButton: {selector: '#channelHeaderDropdownButton'},
                        channelHeaderDropdownIcon: {selector: '#channelHeaderDropdownIcon'},
                        channelHeaderDropdownMenu: {selector: '#channelHeaderDropdownMenu'},
                    },
                },
                channelMember: {
                    selector: '#channelMember',
                    elements: {
                        memberPopover: {selector: '#member_popover'},
                        channelMemberCountText: {selector: '#channelMemberCountText'},
                        channelMemberIcon: {selector: '#channelMemberIcon'},
                    },
                },
                searchFormContainer: {
                    selector: '#searchFormContainer',
                    elements: {
                        searchIcon: {selector: '#searchIcon'},
                        searchBox: {selector: '#searchBox'},
                        searchClearButton: {selector: '#searchClearButton'},
                    },
                },
            },
            elements: {
                channelHeaderPinButton: {selector: '#channelHeaderPinButton'},
                channelHeaderMentionButton: {selector: '#channelHeaderMentionButton'},
                channelHeaderFlagButton: {selector: '#channelHeaderFlagButton'},
            },
        },
    },
};
