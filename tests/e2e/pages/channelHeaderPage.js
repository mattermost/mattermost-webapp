// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Constants} from '../utils';

const centerChannelHeaderCommands = {
    navigateToPage() {
        return this.waitForElementVisible('@headerContainer', Constants.DEFAULT_WAIT);
    },
};

module.exports = {
    url: `${Constants.TEST_BASE_URL}`,
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
