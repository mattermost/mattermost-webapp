// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Constants} from '../utils';

const acountSettingsModalPageCommands = {
    navigateToPage() {
        return this.waitForElementVisible('@accountSettingsModal', Constants.DEFAULT_WAIT);
    },
};

const header = {selector: '#accountSettingsHeader'};
const title = {selector: '#accountSettingsTitle'};
const closeButton = {
    selector: '//*[@id="accountSettingsModal"]/div/div/div[1]/button',
    locateStrategy: 'xpath',
};
const generalButton = {selector: '#generalButton'};
const securityButton = {selector: '#securityButton'};
const notificationsButton = {selector: '#notificationsButton'};
const displayButton = {selector: '#displayButton'};
const advancedButton = {selector: '#advancedButton'};
const tabList = {
    selector: '#tabList',
    elements: {
        generalLi: {selector: '#generalLi'},
        generalButton,
        securityLi: {selector: '#securityLi'},
        securityButton,
        notificationsLi: {selector: '#notificationsLi'},
        notificationsButton,
        displayLi: {selector: '#displayLi'},
        displayButton,
        advancedLi: {selector: '#advancedLi'},
        advancedButton,
    },
};

const generalSettings = {
    selector: '#generalSettings',
    elements: {
        generalSettingsTitle: {selector: '#generalSettingsTitle'},
        nameTitle: {selector: '#nameTitle'},
        nameEdit: {selector: '#nameEdit'},
        nameDesc: {selector: '#nameDesc'},
        usernameTitle: {selector: '#usernameTitle'},
        usernameEdit: {selector: '#usernameEdit'},
        usernameDesc: {selector: '#usernameDesc'},
        nicknameTitle: {selector: '#nicknameTitle'},
        nicknameEdit: {selector: '#nicknameEdit'},
        nicknameDesc: {selector: '#nicknameDesc'},
        positionTitle: {selector: '#positionTitle'},
        positionEdit: {selector: '#positionEdit'},
        positionDesc: {selector: '#positionDesc'},
        emailTitle: {selector: '#emailTitle'},
        emailEdit: {selector: '#emailEdit'},
        emailDesc: {selector: '#emailDesc'},
        pictureTitle: {selector: '#pictureTitle'},
        pictureEdit: {selector: '#pictureEdit'},
        pictureDesc: {selector: '#pictureDesc'},
    },
};

const displaySettings = {
    selector: '#displaySettings',
    elements: {
        displaySettingsTitle: {selector: '#displaySettingsTitle'},
        themeTitle: {selector: '#themeTitle'},
        themeEdit: {selector: '#themeEdit'},
        themeDesc: {selector: '#themeDesc'},
        clockTitle: {selector: '#clockTitle'},
        clockEdit: {selector: '#clockEdit'},
        clockDesc: {selector: '#clockDesc'},
        teammateNameDisplayTitle: {selector: '#name_formatTitle'},
        teammateNameDisplayEdit: {selector: '#name_formatEdit'},
        teammateNameDisplayDesc: {selector: '#name_formatDesc'},
        linkPreviewTitle: {selector: '#linkpreviewTitle'},
        linkPreviewEdit: {selector: '#linkpreviewEdit'},
        linkPreviewDesc: {selector: '#linkpreviewDesc'},
        collapseTitle: {selector: '#collapseTitle'},
        collapseEdit: {selector: '#collapseEdit'},
        collapseDesc: {selector: '#collapseDesc'},
        messageDisplayTitle: {selector: '#message_displayTitle'},
        messageDisplayEdit: {selector: '#message_displayEdit'},
        messageDisplayDesc: {selector: '#message_displayDesc'},
        channelDisplayModeTitle: {selector: '#channel_display_modeTitle'},
        channelDisplayModeEdit: {selector: '#channel_display_modeEdit'},
        channelDisplayModeDesc: {selector: '#channel_display_modeDesc'},
        languageTitle: {selector: '#languagesTitle'},
        languageEdit: {selector: '#languagesEdit'},
        languageDesc: {selector: '#languagesDesc'},
    },
};

module.exports = {
    url: `${Constants.TEST_BASE_URL}`,
    commands: [acountSettingsModalPageCommands],
    sections: {
        accountSettingsModal: {
            selector: '#accountSettingsModal',
            sections: {
                tabList,
                generalSettings,
                displaySettings,
            },
            elements: {
                header,
                title,
                closeButton,
                generalButton,
                securityButton,
                notificationsButton,
                displayButton,
                advancedButton,
            },
        },
    },
};
