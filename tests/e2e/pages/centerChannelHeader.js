// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Constants} from '../utils';

const centerChannelHeaderCommands = {
    navigateToPage() {
        return this.waitForElementVisible('@headerContainer', Constants.DEFAULT_WAIT);
    }
};

module.exports = {
    url: `${Constants.TEST_BASE_URL}`,
    commands: [centerChannelHeaderCommands],
    elements: {
        headerContainer: {
            selector: '//*[@id="channel-header"]',
            locateStrategy: 'xpath'
        },
        flexParent: {
            selector: '//*[@id="channel-header"]/div',
            locateStrategy: 'xpath'
        },
        headerInfo: {
            selector: '//*[@id="channel-header"]/div/div[1]/div',
            locateStrategy: 'xpath'
        },
        toggleFavorite: {
            selector: '//*[@id="toggleFavorite"]',
            locateStrategy: 'xpath'
        },
        dropdownButton: {
            selector: '//*[@id="channelHeaderDropdown"]',
            locateStrategy: 'xpath'
        },
        dropdownMenu: {
            selector: '//*[@id="channel-header"]/div/div[1]/div/div/ul',
            locateStrategy: 'xpath'
        },
        headerDescription: {
            selector: '//*[@id="channel-header"]/div/div[1]/div/div[2]',
            locateStrategy: 'xpath'
        },
        headerMember: {
            selector: '//*[@id="channel-header"]/div/div[3]/div',
            locateStrategy: 'xpath'
        },
        headerMemberText: {
            selector: '//*[@id="member_popover"]/span[1]',
            locateStrategy: 'xpath'
        },
        headerMemberIcon: {
            selector: '//*[@id="member_popover"]/span[2]',
            locateStrategy: 'xpath'
        },
        headerPin: {
            selector: '//*[@id="channel-header"]/div/div[4]/div',
            locateStrategy: 'xpath'
        },
        headerSearchBar: {
            selector: '//*[@id="channel-header"]/div/div[5]',
            locateStrategy: 'xpath'
        },
        headerAtMention: {
            selector: '//*[@id="channel-header"]/div/div[6]/div',
            locateStrategy: 'xpath'
        },
        headerFlag: {
            selector: '//*[@id="channel-header"]/div/div[7]/div',
            locateStrategy: 'xpath'
        }
    }
};
