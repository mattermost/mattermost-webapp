// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// **************************************************************

describe('Account Settings > Display > Theme Colors > Custom Theme > Center Channel Styles', () => {
    before(() => {
        // 1. Go to Account Settings with "user-1"
        cy.toAccountSettingsModal('user-1');
    });

    it('should render min setting view', () => {
        // * Check that the Display tab is loaded
        cy.get('#displayButton').should('be.visible');

        // 2. Click the Display tab
        cy.get('#displayButton').click();

        // * Check that it changed into the Display section
        cy.get('#displaySettingsTitle').should('be.visible').should('contain', 'Display Settings');

        //  * Check the min setting view for each element that is present and contains the expected values
        cy.minDisplaySettings();
    });

    it('should change Center Channel BG color  and verify color change', () => {
        // 1. Selecting Theme Edit, Custom Theme, and Center Channel Styles dropdown
        cy.customColors(1, 'Center Channel Styles');

        // 2. Selecting Center Channel BG
        cy.get('.input-group-addon').eq(13).click();

        // 4. Click on color window to change color
        cy.get('.saturation-black').click();

        // 5. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check Center Channel BG icon color change
        cy.get('.color-icon').eq(13).should('have.css', 'background-color', 'rgb(129, 65, 65)');

        // 6. Save Center Channel BG color change
        cy.get('#saveSetting').click();

        // * Check Center Channel BG color
        cy.get('.sidebar--right').should('have.css', 'background-color', 'rgb(129, 65, 65)');
    });

    it('should change Center Channel Text color  and verify color change', () => {
        // 1. Selecting Theme Edit, Custom Theme, and Center Channel Styles dropdown
        cy.customColors(1, 'Center Channel Styles');

        // 2. Selecting Center Channel Text
        cy.get('.input-group-addon').eq(14).click();

        // 4. Click on color window to change color
        cy.get('.saturation-black').click();

        // 5. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check Center Channel Text icon color change
        cy.get('.color-icon').eq(14).should('have.css', 'background-color', 'rgb(81, 65, 129)');

        // 6. Save Center Channel Text color change
        cy.get('#saveSetting').click();

        // * Check Center Channel Text color
        cy.get('#displaySettingsTitle').should('have.css', 'color', 'rgb(81, 65, 129)');
    });

    it('should change New Message Separator color  and verify color change', () => {
        // 1. Login as sysadmin and navigate to user-1 convo
        cy.login('sysadmin');
        cy.visit('/ad-1/messages/@user-1');

        // 2. Post a message to user-1
        cy.postMessage('Hola!');

        // 3. Logout of sysadmin.
        cy.get('#sidebarHeaderDropdownButton').click();
        cy.get('#logout').click();

        // 4. Login to user-1
        cy.login('user-1');

        // 5. Selecting Sidebar Header Dropdown, Account Settings, and Display Settings
        cy.get('#sidebarHeaderDropdownButton').click();
        cy.get('#accountSettings').click();
        cy.get('#displayButton').click();

        // Selecting Theme Edit, Custom Theme, and Center Channel Styles dropdown
        cy.customColors(1, 'Center Channel Styles');

        // 6. Selecting New Message Separator
        cy.get('.input-group-addon').eq(15).click();

        // 7. Click on color window to change color
        cy.get('.hue-horizontal').click();

        // 8. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check New Message Separator icon color change
        cy.get('.color-icon').eq(15).should('have.css', 'background-color', 'rgb(0, 255, 250)');

        // 9. Save New Message Separator color change
        cy.get('#saveSetting').click();

        // * Navigate to sysadmin convo
        cy.visit('/ad-1/messages/@sysadmin');

        // * Check New Message Separator color in sysadmin convo
        cy.get('.new-separator').find('.separator__hr').should('have.css', 'border-color', 'rgba(0, 255, 250, 0.5)');
    });

    it('should change Mention Highlight BG color  and verify color change', () => {
        // 1. Login as sysadmin and navigate to user-1 convo
        cy.login('sysadmin');
        cy.visit('/ad-1/messages/@user-1');

        // 2. Post a message to user-1
        cy.postMessage('@user-1');

        // 3. Login to user-1
        cy.login('user-1');

        // 4. Selecting Sidebar Header Dropdown, Account Settings, and Display Settings
        cy.get('#sidebarHeaderDropdownButton').click();
        cy.get('#accountSettings').click();
        cy.get('#displayButton').click();

        // Selecting Theme Edit, Custom Theme, and Center Channel Styles dropdown
        cy.customColors(1, 'Center Channel Styles');

        // 5. Selecting Mention Highlight BG
        cy.get('.input-group-addon').eq(17).click();

        // 6. Click on color window to change color
        cy.get('.saturation-black').click();

        // 7. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check Mention Highlight BG icon color change
        cy.get('.color-icon').eq(17).should('have.css', 'background-color', 'rgb(129, 117, 65)');

        // This isn't saving for some reason, making the second half of this test fail.

        // 8. Save Mention Highlight BG color change
        cy.get('.save-button').click();

        cy.get('#accountSettingsHeader > .close').click();

        // * Navigate to sysadmin convo
        cy.visit('/ad-1/messages/@sysadmin');

        // * Check Mention Highlight BG color in sysadmin convo
        cy.get('.mention--highlight').should('have.css', 'background', 'rgb(129, 117, 65) none repeat scroll 0% 0% / auto padding-box border-box');
    });

    it('should change Mention Highlight Link color  and verify color change', () => {
        // 1. Selecting Sidebar Header Dropdown, Account Settings, and Display Settings
        cy.get('#sidebarHeaderDropdownButton').click();
        cy.get('#accountSettings').click();
        cy.get('#displayButton').click();

        // Selecting Theme Edit, Custom Theme, and Center Channel Styles dropdown
        cy.customColors(1, 'Center Channel Styles');

        // 2. Selecting Mention Highlight Link
        cy.get('.input-group-addon').eq(18).click();

        // 3. Click on color window to change color
        cy.get('.saturation-black').click();

        // 4. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check New Message Separator icon color change
        cy.get('.color-icon').eq(18).should('have.css', 'background-color', 'rgb(65, 92, 129)');

        // 5. Save Mention Highlight Link color change
        cy.get('.save-button').click();

        cy.get('#accountSettingsHeader > .close').click();

        // * Navigate to sysadmin convo
        cy.visit('/ad-1/messages/@sysadmin');

        // * Check Mention Highlight Link color in sysadmin convo
        cy.get('.mention-link').should('have.css', 'color', 'rgb(65, 92, 129)');
    });

    it('should revert any color changes made', () => {
        // 1. Selecting Sidebar Header Dropdown, Account settings, and Display Settings
        cy.get('#sidebarHeaderDropdownButton').click();
        cy.get('#accountSettings').click();
        cy.get('#displayButton').click();

        // 3. Click "Edit" to the right of Theme
        cy.get('#themeEdit').click();

        // 4. Select Standard Theme
        cy.get('#standardThemes').click();

        // 5. Select the Mattermost Theme
        cy.get('.col-xs-6.col-sm-3.premade-themes').first().click();

        // 6. Select the Save button to save changes
        cy.get('#saveSetting').click();
    });
});
