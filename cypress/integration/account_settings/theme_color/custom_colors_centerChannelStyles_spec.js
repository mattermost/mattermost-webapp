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
    after(() => {
        // * Revert any color changes made by selecting the default Mattermost theme
        cy.defaultTheme('user-1');
    });

    it('should render min setting view', () => {
        // * Check that the Display tab is loaded
        cy.get('#displayButton').should('be.visible');

        // 2. Click the Display tab
        cy.get('#displayButton').click();

        // * Check that it changed into the Display sectiogit pun
        cy.get('#displaySettingsTitle').should('be.visible').should('contain', 'Display Settings');

        //  * Check the min setting view for each element that is present and contains the expected values
        cy.minDisplaySettings();
    });

    it('should change Center Channel BG color and verify color change', () => {
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

        // * Check that "centerChannelBg" is updated
        cy.get('#pasteBox').scrollIntoView().should('contain', '"centerChannelBg":"#814141"');

        // 6. Save Center Channel BG color change
        cy.get('#saveSetting').click();

        // * Check Center Channel BG color
        cy.get('.sidebar--right').should('have.css', 'background-color', 'rgb(129, 65, 65)');
    });

    it('should change Center Channel Text color and verify color change', () => {
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

        // * Check that "centerChannelColor" is updated
        cy.get('#pasteBox').scrollIntoView().should('contain', '"centerChannelColor":"#514181"');

        // 6. Save Center Channel Text color change
        cy.get('#saveSetting').click();

        // * Check Center Channel Text color
        cy.get('#displaySettingsTitle').should('have.css', 'color', 'rgb(81, 65, 129)');
    });

    it('should change New Message Separator color and verify color change', () => {
        // 1. Login as sysadmin and navigate to user-1 convo
        cy.login('sysadmin');
        cy.visit('/ad-1/messages/@user-1');

        // 2. Post a message to user-1
        cy.postMessage('Hola!');

        // 3. Logout of sysadmin.
        cy.get('#sidebarHeaderDropdownButton').click();
        cy.get('#logout').click().wait(500);

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

        // * Check that "newMessageSeparator" is updated
        cy.get('#pasteBox').scrollIntoView().should('contain', '"newMessageSeparator":"#00fffa"');

        // 9. Save New Message Separator color change
        cy.get('#saveSetting').click();

        // * Navigate to sysadmin convo
        cy.visit('/ad-1/messages/@sysadmin');

        // * Check New Message Separator color in sysadmin convo
        cy.get('.new-separator').find('.separator__hr').should('have.css', 'border-color', 'rgba(0, 255, 250, 0.5)');
    });

    it('should change Mention Highlight BG color and verify color change', () => {
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

        // * Check that "mentionHighlightBg" is updated
        cy.get('#pasteBox').scrollIntoView().should('contain', '"mentionHighlightBg":"#817541"');

        // 8. Save Mention Highlight BG color change
        cy.get('.save-button.btn.btn-primary').click();
    });

    it('should change Mention Highlight Link color and verify color change', () => {
        // Selecting Theme Edit, Custom Theme, and Center Channel Styles dropdown
        cy.customColors(1, 'Center Channel Styles');

        // 1. Selecting Mention Highlight Link
        cy.get('.input-group-addon').eq(18).click();

        // 2. Click on color window to change color
        cy.get('.hue-horizontal').click();

        // 3. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check Mention Highlight Link icon color change
        cy.get('.color-icon').eq(18).should('have.css', 'background-color', 'rgb(22, 224, 224)');

        // * Check that "mentionHighlightLink" is updated
        cy.get('#pasteBox').scrollIntoView().should('contain', '"mentionHighlightLink":"#16e0e0"');

        // 4. Save Mention Highlight Link color change
        cy.get('.save-button.btn.btn-primary').click({force: true});
    });
});
