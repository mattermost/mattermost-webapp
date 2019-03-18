// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// **************************************************************

describe('Account Settings > Display > Theme Colors > Custom Theme > Sidebar Styles', () => {
    before(() => {
        // 1. Go to Account Settings with "user-1"
        cy.toAccountSettingsModal('user-1');
    });

    after(() => {
        // * Revert any color changes made by selecting the default Mattermost theme
        cy.defaultTheme('user-1');
    });

    it('should render min setting view', () => {
        // * Check that the Display tab is loaded
        cy.get('#displayButton').should('be.visible');

        // 2. Click the Display tab
        cy.get('#displayButton').click();

        // * Check that it changed into the Display section
        cy.get('#displaySettingsTitle').should('be.visible').should('contain', 'Display Settings');

        // * Check the min setting view for each element that is present and contains the expected values
        cy.minDisplaySettings();
    });

    it('should change Sidebar BG color and verify color change', () => {
        // 1. Selecting Theme Edit, Custom Theme, and Sidebar Styles dropdown
        cy.customColors(0, 'Sidebar Styles');

        // 2. Click Sidebar BG
        cy.get('.input-group-addon').eq(0).click();

        // 3. Click on color bar to change color
        cy.get('.hue-horizontal').click();

        // 4. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check Sidebar BG color icon change
        cy.get('.color-icon').eq(0).should('have.css', 'background-color', 'rgb(20, 191, 188)');

        // * Check that "sidebarBg" is updated
        cy.get('#pasteBox').scrollIntoView().should('contain', '"sidebarBg":"#14bfbc"');

        // * Check Sidebar BG color change
        cy.get('.settings-links').should('have.css', 'background-color', 'rgb(20, 191, 188)');

        // 5. Save Sidebar BG color change
        cy.get('#saveSetting').click();

        // * Check Sidebar BG color change after saving
        cy.get('.settings-links').should('have.css', 'background-color', 'rgb(20, 191, 188)');
    });

    it('should change Sidebar Text color and verify color change', () => {
        // 1. Selecting Theme Edit, Custom Theme, and Sidebar Styles dropdown
        cy.customColors(0, 'Sidebar Styles');

        // 2. Click Sidebar Text
        cy.get('.input-group-addon').eq(1).click();

        // 3. Click in color window to change color
        cy.get('.saturation-black').click();

        // 4. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check Sidebar Text icon color change
        cy.get('.color-icon').eq(1).should('have.css', 'background-color', 'rgb(129, 65, 65)');

        // * Check that "sidebarText" is updated
        cy.get('#pasteBox').scrollIntoView().should('contain', '"sidebarText":"#814141"');

        // * Check Sidebar Text color change
        cy.get('#generalButton').should('have.css', 'color', 'rgba(129, 65, 65, 0.6)');

        // 5. Save Sidebar Text color change
        cy.get('#saveSetting').click();

        // * Check Sidebar Text color change after saving
        cy.get('#generalButton').should('have.css', 'color', 'rgba(129, 65, 65, 0.6)');
    });

    it('should change Sidebar Header BG color and verify color change', () => {
        // 1. Selecting Theme Edit, Custom Theme, and Sidebar Styles dropdown
        cy.customColors(0, 'Sidebar Styles');

        // 2. Click Sidebar Header BG
        cy.get('.input-group-addon').eq(2).click();

        // 3. Click on color bar to change color
        cy.get('.hue-horizontal').click();

        // 4. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check Sidebar Header BG icon color change
        cy.get('.color-icon').eq(2).should('have.css', 'background-color', 'rgb(17, 171, 168)');

        // * Check that "sidebarHeaderBg" is updated
        cy.get('#pasteBox').scrollIntoView().should('contain', '"sidebarHeaderBg":"#11aba8"');

        // * Check Sidebar Header BG color change
        cy.get('#accountSettingsHeader').should('have.css', 'background', 'rgb(17, 171, 168) none repeat scroll 0% 0% / auto padding-box border-box');

        // 5. Save Sidebar Header BG color change
        cy.get('#saveSetting').click();

        // * Check Sidebar Header BG color change after saving
        cy.get('#accountSettingsHeader').should('have.css', 'background', 'rgb(17, 171, 168) none repeat scroll 0% 0% / auto padding-box border-box');
    });

    it('should change Sidebar Header Text color and verify color change', () => {
        // 1. Selecting Theme Edit, Custom Theme, and Sidebar Styles dropdown
        cy.customColors(0, 'Sidebar Styles');

        // 2. Click Sidebar Header Text
        cy.get('.input-group-addon').eq(3).click();

        // 3. Cick on color window to change color
        cy.get('.saturation-black').click();

        // 4. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check Sidebar Header Text icon color change
        cy.get('.color-icon').eq(3).should('have.css', 'background-color', 'rgb(129, 65, 65)');

        // * Check that "sidebarHeaderTextColor" is updated
        cy.get('#pasteBox').scrollIntoView().should('contain', '"sidebarHeaderTextColor":"#814141"');

        // * Check Sidebar Header Text color change
        cy.get('#accountSettingsTitle').should('have.css', 'color', 'rgb(129, 65, 65)');

        // 5. Save Sidebar Header Text color change
        cy.get('#saveSetting').click();

        // * Check Sidebar Header Text color change after saving
        cy.get('#accountSettingsTitle').should('have.css', 'color', 'rgb(129, 65, 65)');
    });

    it('should change Sidebar Unread Text color and verify color change', () => {
        // 1. Selecting Theme Edit, Custom Theme, and Sidebar Styles dropdown
        cy.customColors(0, 'Sidebar Styles');

        // 2. Click Sidebar Unread Text
        cy.get('.input-group-addon').eq(4).click();

        // 3. Click on color window to change color
        cy.get('.saturation-black').click();

        // 4. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check Sidebar Unread Text icon color change
        cy.get('.color-icon').eq(4).should('have.css', 'background-color', 'rgb(129, 65, 65)');

        // * Check that "sidebarUnreadText" is updated
        cy.get('#pasteBox').scrollIntoView().should('contain', '"sidebarUnreadText":"#814141"');

        // 5. Save Sidebar Unread Text color change
        cy.get('#saveSetting').click();

        // 6. Exit user settings
        cy.get('#accountSettingsHeader > .close').click();

        // * Check Sidebar Unread Text
        cy.get('.sidebar-item.unread-title').should('have.css', 'color', 'rgb(129, 65, 65)');

        // 7. Open sidebar dropdown
        cy.get('#sidebarHeaderDropdownButton').click();

        // 8. Select Account Settings
        cy.get('#accountSettings').click();

        // 9. Click the Display tab
        cy.get('#displayButton').click();
    });

    it('should change Sidebar Text Hover BG color and verify color change', () => {
        // 1. Selecting Theme Edit, Custom Theme, and Sidebar Styles dropdown
        cy.customColors(0, 'Sidebar Styles');

        // 2. Click Sidebar Text Hover BG
        cy.get('.input-group-addon').eq(5).click();

        // 3. Click on color bar to change color
        cy.get('.hue-horizontal').click();

        // 4. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check Sidebar Text Hover BG color icon change
        cy.get('.color-icon').eq(5).should('have.css', 'background-color', 'rgb(69, 191, 191)');

        // * Check that "sidebarTextHoverBg" is updated
        cy.get('#pasteBox').scrollIntoView().should('contain', '"sidebarTextHoverBg":"#45bfbf"');

        // 5. Save Sidebar Text Hover BG color change
        cy.get('#saveSetting').click();
    });

    it('should change Sidebar Text Active Border color and verify color change', () => {
        // 1. Selecting Theme Edit, Custom Theme, and Sidebar Styles dropdown
        cy.customColors(0, 'Sidebar Styles');

        // 2. Click Sidebar Text Active Border
        cy.get('.input-group-addon').eq(6).click();

        // 3. Click on color window to change color
        cy.get('.saturation-black').click();

        // 4. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check Sidebar Text Active Border icon color change
        cy.get('.color-icon').eq(6).should('have.css', 'background-color', 'rgb(65, 92, 129)');

        // * Check that "sidebarTextActiveBorder" is updated
        cy.get('#pasteBox').scrollIntoView().should('contain', '"sidebarTextActiveBorder":"#415c81"');

        // 5. Save Sidebar Text Active Border color change
        cy.get('#saveSetting').click();
    });

    it('should change Sidebar Text Active Color and verify color change', () => {
        // 1. Selecting Theme Edit, Custom Theme, and Sidebar Styles dropdown
        cy.customColors(0, 'Sidebar Styles');

        // 2. Click Sidebar Text Active Color
        cy.get('.input-group-addon').eq(7).click();

        // 3. Click on color window to change color
        cy.get('.saturation-black').click();

        // 4. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check Sidebar Text Active Color icon color change
        cy.get('.color-icon').eq(7).should('have.css', 'background-color', 'rgb(129, 65, 65)');

        // * Check that "sidebarTextActiveColor" is updated
        cy.get('#pasteBox').scrollIntoView().should('contain', '"sidebarTextActiveColor":"#814141"');

        // 5. Save Sidebar Text Active Color change
        cy.get('#saveSetting').click();

        // * Check Sidebar Text Active Color
        cy.get('#displayButton').should('have.css', 'color', 'rgb(129, 65, 65)');
    });

    it('should change Online Indicator color and verify color change', () => {
        // 1. Selecting Theme Edit, Custom Theme, and Sidebar Styles dropdown
        cy.customColors(0, 'Sidebar Styles');

        // 2. Click Online Indicator
        cy.get('.input-group-addon').eq(8).click();

        // 3. Click on color window to change color
        cy.get('.saturation-black').click();

        // 4. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check Online Indicator icon color change
        cy.get('.color-icon').eq(8).should('have.css', 'background-color', 'rgb(65, 129, 113)');

        // * Check that "onlineIndicator" is updated
        cy.get('#pasteBox').scrollIntoView().should('contain', '"onlineIndicator":"#418171"');

        // 5. Save Online Indicator color change
        cy.get('#saveSetting').click();

        // 6. Exit User Settings
        cy.get('#accountSettingsHeader > .close').click();

        // * Check Online Indicator color
        cy.get('.online--icon').should('have.css', 'fill', 'rgb(65, 129, 113)');
    });

    it('should change Away Indicator color and verify color change', () => {
        // 1. Selecting Sidebar Header Dropdown, Account Settings, and Display Settings
        cy.get('#sidebarHeaderDropdownButton').click();
        cy.get('#accountSettings').click();
        cy.get('#displayButton').click();

        // 2. Selecting Theme Edit, Custom Theme, and Sidebar Styles dropdown
        cy.customColors(0, 'Sidebar Styles');

        // 3. Click Away Indicator
        cy.get('.input-group-addon').eq(9).click();

        // 4. Click on color window to change color
        cy.get('.saturation-black').click();

        // 5. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check Away Indicator icon color change
        cy.get('.color-icon').eq(9).should('have.css', 'background-color', 'rgb(129, 106, 65)');

        // * Check that "awayIndicator" is updated
        cy.get('#pasteBox').scrollIntoView().should('contain', '"awayIndicator":"#816a41"');

        // 6. Save Away Indicator color change
        cy.get('#saveSetting').click();

        // 7. Exit User Settings
        cy.get('#accountSettingsHeader > .close').click();

        // 8. Change user-1 status to Away
        cy.userStatus(1);

        // * Check Away Indicator color
        cy.get('.away--icon').should('have.css', 'fill', 'rgb(129, 106, 65)');

        // 9. Revert user-1 status to Online
        cy.userStatus(0);
    });

    it('should change Do Not Disturb Indicator color and verify color change', () => {
        // 1. Selecting Sidebar Header Dropdown, Account Settigns, and Display Settings
        cy.get('#sidebarHeaderDropdownButton').click();
        cy.get('#accountSettings').click();
        cy.get('#displayButton').click();

        // 2. Selecting Theme Edit, Custom Theme, and Sidebar Styles dropdown
        cy.customColors(0, 'Sidebar Styles');

        // 3. Click Do Not Disturb Indicator
        cy.get('.input-group-addon').eq(10).click();

        // 4. Click on color window to change color
        cy.get('.saturation-black').click();

        // 5. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check Do Not Disturb Indicator icon color change
        cy.get('.color-icon').eq(10).should('have.css', 'background-color', 'rgb(129, 65, 65)');

        // * Check that "dndIndicator" is updated
        cy.get('#pasteBox').scrollIntoView().should('contain', '"dndIndicator":"#814141"');

        // 6. Save Do Not Disturb Indicator color change
        cy.get('#saveSetting').click();

        // 7. Exit User Settings
        cy.get('#accountSettingsHeader > .close').click();

        // 8. Change user-1 status to Do Not Disturb
        cy.userStatus(2);

        // * Check Do Not Disturb Indicator color
        cy.get('.dnd--icon').should('have.css', 'fill', 'rgb(129, 65, 65)');

        // 9. Revert user-1 status to Online
        cy.userStatus(0);
    });

    it('should change Mention Jewel BG color and verify color change', () => {
        // 1. Selecting Sidebar Header Dropdown, Account Settigns, and Display Settings
        cy.get('#sidebarHeaderDropdownButton').click();
        cy.get('#accountSettings').click();
        cy.get('#displayButton').click();

        // 2. Selecting Theme Edit, Custom Theme, and Sidebar Styles dropdown
        cy.customColors(0, 'Sidebar Styles');

        // 3. Click Mention Jewel BG
        cy.get('.input-group-addon').eq(11).click();

        // 4. Click on color window to change color
        cy.get('.saturation-black').click();

        // 5. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check Mention Jewel BG icon color change
        cy.get('.color-icon').eq(11).should('have.css', 'background-color', 'rgb(129, 65, 65)');

        // * Check that "mentionBj" is updated
        cy.get('#pasteBox').scrollIntoView().should('contain', '"mentionBj":"#814141"');

        // 6. Save Mention Jewel BG color change
        cy.get('#saveSetting').click();

        // 7. Exit User Settings
        cy.get('#accountSettingsHeader > .close').click();

        // * Check Mention Jewel BG color
        cy.get('#unreadIndicatorBottom').should('have.css', 'background-color', 'rgb(129, 65, 65)');
    });

    it('should change Mention Jewel Text color and verify color change', () => {
        // 1. Selecting Sidebar Header Dropdown, Account Settigns, and Display Settings
        cy.get('#sidebarHeaderDropdownButton').click();
        cy.get('#accountSettings').click();
        cy.get('#displayButton').click();

        // 2. Selecting Theme Edit, Custom Theme, and Sidebar Styles dropdown
        cy.customColors(0, 'Sidebar Styles');

        // 3. Click Mention Jewel Text
        cy.get('.input-group-addon').eq(12).click();

        // 4. Click on color window to change color
        cy.get('.saturation-black').click();

        // 5. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check Mention Jewel Text icon color change
        cy.get('.color-icon').eq(12).should('have.css', 'background-color', 'rgb(65, 92, 129)');

        // * Check that "mentioncolor" is updated
        cy.get('#pasteBox').scrollIntoView().should('contain', '"mentionColor":"#415c81"');

        // 6. Save Mention Jewel Text color change
        cy.get('#saveSetting').click();

        // 7. Exit User Settings
        cy.get('#accountSettingsHeader > .close').click();

        // * Check Mention Jewel Text color
        cy.get('#unreadIndicatorBottom').should('have.css', 'color', 'rgb(65, 92, 129)');
    });
});
