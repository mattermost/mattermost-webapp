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

        // * Check that it changed into the Display section
        cy.get('#displaySettingsTitle').should('be.visible').should('contain', 'Display Settings');

        //  * Check the min setting view for each element that is present and contains the expected values
        cy.minDisplaySettings();
    });

    it('should change Link Color and verify color change', () => {
        // Selecting Theme Edit, Custom Theme, and Center Channel Styles dropdown
        cy.customColors(2, 'Link and Button Styles');

        // 1. Selecting Link Color
        cy.get('.input-group-addon').eq(20).click();

        // 2. Click on color window to change color
        cy.get('.hue-horizontal').click();

        // 3. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check Link Color icon color change
        cy.get('.color-icon').eq(19).should('have.css', 'background-color', 'rgb(35, 215, 212)');

        // * Check that "linkColor" is updated
        cy.get('#pasteBox').scrollIntoView().should('contain', '"linkColor":"#23d7d4"');

        // 4. Save Link Color change
        cy.get('#saveSetting').click();

        // * Check Link Color for Theme Edit link
        cy.get('#themeEdit').should('have.css', 'color', 'rgb(35, 215, 212)');
    });

    it('should change Button BG color and verify color change', () => {
        // Selecting Theme Edit, Custom Theme, and Center Channel Styles dropdown
        cy.customColors(2, 'Link and Button Styles');

        // 1. Selecting Button BG color
        cy.get('.input-group-addon').eq(21).click();

        // 2. Click on color window to change color
        cy.get('.saturation-black').click();

        // 3. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check Button BG color icon color change
        cy.get('.color-icon').eq(20).should('have.css', 'background-color', 'rgb(64, 92, 129)');

        // * Check that "buttonBg" is updated
        cy.get('#pasteBox').scrollIntoView().should('contain', '"buttonBg":"#405c81"');

        // 4. Save Button BG color change
        cy.get('#saveSetting').click();

        // 5. Select Theme Edit link
        cy.get('#themeEdit').click();

        // 6. Check Button BG color for Save button
        cy.get('#saveSetting').should('have.css', 'background-color', 'rgb(64, 92, 129)');
    });

    it('should change Button Text color and verify color change', () => {
        // Selecting Center Channel Styles dropdown
        cy.get('.theme-elements__header').eq(2).should('contain', 'Link and Button Styles').click();

        // 1. Selecting Button Text color
        cy.get('.input-group-addon').eq(22).click();

        // 2. Click on color window to change color
        cy.get('.saturation-black').click();

        // 3. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check Button Text color icon color change
        cy.get('.color-icon').eq(21).should('have.css', 'background-color', 'rgb(129, 65, 65)');

        // * Check that "buttonColor" is updated
        cy.get('#pasteBox').scrollIntoView().should('contain', '"buttonColor":"#814141"');

        // 4. Save Button Text color change
        cy.get('#saveSetting').click();

        // 5. Select Theme Edit link
        cy.get('#themeEdit').click();

        // 6. Check Button Text color for Save button
        cy.get('#saveSetting').should('have.css', 'color', 'rgb(129, 65, 65)');
    });
});