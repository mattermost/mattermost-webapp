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
        // cy.get('#displaySettingsTitle').should('be.visible').should('contain', 'Display Settings');

        // * Check the min setting view for each element that is present and contains the expected values
        // cy.minDisplaySettings();
    });

    // it('should change Center Channel BG color  and verify color change', () => {
    //     // 1. Selecting Theme Edit, Custom Theme, and Center Channel Styles dropdown
    //     cy.customColors(1, 'Center Channel Styles');

    //     // 2. Selecting Center Channel BG
    //     cy.get('.input-group-addon').eq(13).click();

    //     // 4. Click on color window to change color
    //     cy.get('.saturation-black').click();

    //     // 5. Click outside of color modal to remove it from view
    //     cy.get('#displaySettingsTitle').click();

    //     // * Check Center Channel BG icon color change
    //     cy.get('.color-icon').eq(13).should('have.css', 'background-color', 'rgb(129, 65, 65)');

    //     // 6. Save Center Channel BG color change
    //     cy.get('#saveSetting').click();

    //     // * Check Center Channel BG color
    //     cy.get('.sidebar--right').should('have.css', 'background-color', 'rgb(129, 65, 65)');
    // });

    // it('should change Center Channel Text color  and verify color change', () => {
    //     // 1. Selecting Theme Edit, Custom Theme, and Center Channel Styles dropdown
    //     cy.customColors(1, 'Center Channel Styles');

    //     // 2. Selecting Center Channel Text
    //     cy.get('.input-group-addon').eq(14).click();

    //     // 4. Click on color window to change color
    //     cy.get('.hue-horizontal').click();

    //     // 5. Click outside of color modal to remove it from view
    //     cy.get('#displaySettingsTitle').click();

    //     // * Check Center Channel Text icon color change
    //     cy.get('.color-icon').eq(14).should('have.css', 'background-color', 'rgb(65, 129, 129)');

    //     // 6. Save Center Channel Text color change
    //     cy.get('#saveSetting').click();

    //     // * Check Center Channel Text color
    //     cy.get('#displaySettingsTitle').should('have.css', 'color', 'rgb(65, 129, 129)');
    // });

    it('should change New Message Separator color  and verify color change', () => {
        // 1. Selecting Theme Edit, Custom Theme, and Center Channel Styles dropdown
        cy.customColors(1, 'Center Channel Styles');

        // 2. Selecting New Message Separator
        cy.get('.input-group-addon').eq(15).click();

        // 4. Click on color window to change color
        cy.get('.hue-horizontal').click();

        // 5. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check New Message Separator icon color change
        cy.get('.color-icon').eq(15).should('have.css', 'background-color', 'rgb(0, 255, 250)');

        // 6. Save New Message Separator color change
        cy.get('#saveSetting').click();

        // * Check New Message Separator color
        cy.get('.new-separator').should('have.css', 'color', 'rgb(0, 255, 250)');
    });

    // it('should revert any color changes made', () => {
    //     // 1. Selecting Sidebar Header Dropdown, Account Settigns, and Display Settings
    //     // cy.get('#sidebarHeaderDropdownButton').click();
    //     // cy.get('#accountSettings').click();
    //     // cy.get('#displayButton').click();

    //     // 3. Click "Edit" to the right of Theme
    //     cy.get('#themeEdit').click();

    //     // 4. Select Standard Theme
    //     cy.get('#standardThemes').click();

    //     // 5. Select the Mattermost Theme
    //     cy.get('.col-xs-6.col-sm-3.premade-themes').first().click();

    //     // 6. Select the Save button to save changes
    //     cy.get('#saveSetting').click();
    // });
});
