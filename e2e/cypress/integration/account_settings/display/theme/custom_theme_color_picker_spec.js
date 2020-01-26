// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../../../fixtures/timeouts';

describe('AS14318 Theme Colors - Color Picker', () => {
    before(() => {
        // Login as user-1
        cy.apiLogin('user-1');
    });

    beforeEach(() => {
        // Navigating to account settings
        cy.toAccountSettingsModal(null, true);
        cy.get('#displayButton').click();
        cy.get('#themeTitle').click();
        cy.get('#customThemes').click();
    });

    after(() => {
        cy.apiSaveThemePreference();
    });

    it('Should be able to use color picker input and change Sidebar theme color', () => {
        // # Change "Sidebar BG" and verify color change
        verifyColorPickerChange(
            'Sidebar Styles',
            '#sidebarBg-squareColorIcon',
            '#sidebarBg-ChromePickerModal',
            '#sidebarBg-squareColorIconValue',
            '#bb123e',
            'rgb(187, 18, 62)'
        );
    });

    it('Should be able to use color picker input and change Center Channel Styles', () => {
        // # Change "Center Channel BG" and verify color change
        verifyColorPickerChange(
            'Center Channel Styles',
            '#centerChannelBg-squareColorIcon',
            '#centerChannelBg-ChromePickerModal',
            '#centerChannelBg-squareColorIconValue',
            '#ff8800',
            'rgb(255, 136, 0)'
        );
    });

    it('Should be able to use color picker input and change Link and Button Styles', () => {
        // # Change "Link Color" and verify color change
        verifyColorPickerChange(
            'Link and Button Styles',
            '#linkColor-squareColorIcon',
            '#linkColor-ChromePickerModal',
            '#linkColor-squareColorIconValue',
            '#ffe577',
            'rgb(255, 229, 119)'
        );
    });
});

function verifyColorPickerChange(stylesText, iconButtonId, modalId, iconValueId, hexValue, rgbValue) {
    // # Open styles section
    cy.findByText(stylesText).scrollIntoView().should('be.visible').click({force: true});

    // # Click the Sidebar BG setting
    cy.get(iconButtonId).click();

    // # Enter hex value
    cy.get(modalId).within(() => {
        cy.get('input').clear({force: true}).invoke('val', hexValue).wait(TIMEOUTS.TINY).type(' {backspace}{enter}', {force: true});
    });

    // # Toggle theme colors the custom theme
    cy.findByText('Theme Colors').scrollIntoView().click({force: true});
    cy.findByText('Custom Theme').scrollIntoView().click({force: true});

    // # Re-open styles section
    cy.findByText(stylesText).scrollIntoView().should('be.visible').click({force: true});

    // * Verify color change is applied correctly
    cy.get(iconValueId).should('have.css', 'background-color', rgbValue);
}
