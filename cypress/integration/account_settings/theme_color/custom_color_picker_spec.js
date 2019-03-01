// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// **************************************************************

describe('Account Settings > Sidebar > Theme Colors > Color Picker', () => {
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

        // * Check the min setting view for each element that is present and contains the expected values
        cy.minDisplaySettings();
    });

    it('should edit theme, select Custom Theme, Check View, and Select Sidebar Styles', () => {
        // 3. Click "Edit" to the right of Theme
        cy.get('#themeEdit').click();

        // 4. Click Custom Theme
        cy.get('#customThemes').click();

        // * Check Custom Theme Display
        cy.get('#displaySettingsTitle').scrollIntoView();
        cy.get('div.theme-elements__header').should('be.visible', 'contain', 'Sidebar Styles');
        cy.get('div.theme-elements__header').should('be.visible', 'contain', 'Center Channel Styles');
        cy.get('div.theme-elements__header').should('be.visible', 'contain', 'Link and BUtton Sytles');
        cy.get('div.padding-top').should('be.visible', 'contain', 'Import theme Colors from Slack');
        cy.get('#saveSetting').should('be.visible', 'contain', 'Save');
        cy.get('#cancelSetting').should('be.visible', 'contain', 'Cancel');

        // 5. Click on Sidebar Styles
        cy.get('.theme-elements__header').first().should('contain', 'Sidebar Styles').click();
    });

    it('should change Sidebar BG color and verify color change', () => {
        // 1. Click Sidebar BG
        cy.get('.input-group-addon').first().click();

        // 2. Click on color bar to change color
        cy.get('.hue-horizontal').click();

        // 3. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check Sidebar BG color icon change
        cy.get('.color-icon').should('have.css', 'background-color', 'rgb(20, 191, 188)');

        // * Check Sidebar BG color change
        cy.get('.settings-links').should('have.css', 'background-color', 'rgb(20, 191, 188)');

        // 4. Save Sidebar BG color change
        cy.get('#saveSetting').click();

        // * Check Sidebar BG color change after saving
        cy.get('.settings-links').should('have.css', 'background-color', 'rgb(20, 191, 188)');
    });

    it('should revert any color changes made', () => {
        // 1. Click "Edit" to the right of Theme
        cy.get('#themeEdit').click();

        // 2. Select Standard Theme
        cy.get('#standardThemes').click()

        // 3. Select the Mattermost Theme
        cy.get('.col-xs-6.col-sm-3.premade-themes').first().click();

        // 4. Select the Save button to save changes
        cy.get('#saveSetting').click()
    });
});
