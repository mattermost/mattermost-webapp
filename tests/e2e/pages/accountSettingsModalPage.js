// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Constants} from '../utils';

const acountSettingsModalPageCommands = {
    navigateToPage() {
        return this.waitForElementVisible('@accountSettingsModal', Constants.DEFAULT_WAIT);
    }
};

const header = {selector: '#accountSettingsHeader'};
const title = {selector: '#accountSettingsTitle'};
const closeButton = {
    selector: '//*[@id="accountSettingsModal"]/div/div/div[1]/button',
    locateStrategy: 'xpath'
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
        advancedButton
    }
};

const displaySettings = {
    selector: '#displaySettings',
    elements: {
        themeTitle: {selector: '#ThemeTitle'},
        themeEdit: {selector: '#ThemeEdit'},
        themeDesc: {selector: '#ThemeDesc'},
        clockTitle: {selector: '#Clock_DisplayTitle'},
        clockEdit: {selector: '#Clock_DisplayEdit'},
        clockDesc: {selector: '#Clock_DisplayDesc'},
        linkPreviewTitle: {selector: '#Website_Link_PreviewsTitle'},
        linkPreviewEdit: {selector: '#Website_Link_PreviewsEdit'},
        linkPreviewDesc: {selector: '#Website_Link_PreviewsDesc'},
        collapseTitle: {selector: '#Default_appearance_of_image_link_previewsTitle'},
        collapseEdit: {selector: '#Default_appearance_of_image_link_previewsEdit'},
        collapseDesc: {selector: '#Default_appearance_of_image_link_previewsDesc'},
        messageDisplayTitle: {selector: '#Message_DisplayTitle'},
        messageDisplayEdit: {selector: '#Message_DisplayEdit'},
        messageDisplayDesc: {selector: '#Message_DisplayDesc'},
        channelDisplayModeTitle: {selector: '#Channel_Display_ModeTitle'},
        channelDisplayModeEdit: {selector: '#Channel_Display_ModeEdit'},
        channelDisplayModeDesc: {selector: '#Channel_Display_ModeDesc'},
        languageTitle: {selector: '#LanguageTitle'},
        languageEdit: {selector: '#LanguageEdit'},
        languageDesc: {selector: '#LanguageDesc'},
    }
};


module.exports = {
    url: `${Constants.TEST_BASE_URL}`,
    commands: [acountSettingsModalPageCommands],
    sections: {
        accountSettingsModal: {
            selector: '#accountSettingsModal',
            sections: {
                tabList,
                displaySettings
            },
            elements: {
                header,
                title,
                closeButton,
                generalButton,
                securityButton,
                notificationsButton,
                displayButton,
                advancedButton
            }
        }
    }
};
