// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @account_setting

import * as TIMEOUTS from '../../../../fixtures/timeouts';

describe('AS14318 Theme Colors - Color Picker', () => {
    before(() => {
        // # Login as new user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    beforeEach(() => {
        cy.reload();
        cy.findByTestId('post_textbox').should('be.visible');

        // # Navigating to account settings
        cy.toAccountSettingsModal();
        cy.get('#displayButton', {timeout: TIMEOUTS.FIVE_SEC}).should('be.visible').click();
        cy.get('#themeTitle', {timeout: TIMEOUTS.ONE_SEC}).should('be.visible').click();
        cy.get('#customThemes', {timeout: TIMEOUTS.ONE_SEC}).should('be.visible').click();
    });

    afterEach(() => {
        // # Click "x" button to close Account Settings modal and then discard changes made
        cy.get('#accountSettingsHeader > .close').should('be.visible').click();
        cy.findAllByText('Yes, Discard', {timeout: TIMEOUTS.ONE_SEC}).should('be.visible').click();
    });

    it('Should be able to use color picker input and change Sidebar theme color', () => {
        // # Change "Sidebar BG" and verify color change
        verifyColorPickerChange(
            'Sidebar Styles',
            '#sidebarBg-squareColorIcon',
            '#sidebarBg-inputColorValue',
            '#sidebarBg-squareColorIconValue',
            '#B0B6BD',
            'rgb(176, 182, 189)',
        );
    });

    it('Should be able to use color picker input and change Center Channel Styles', () => {
        // # Change "Center Channel BG" and verify color change
        verifyColorPickerChange(
            'Center Channel Styles',
            '#centerChannelBg-squareColorIcon',
            '#centerChannelBg-inputColorValue',
            '#centerChannelBg-squareColorIconValue',
            '#BDB0B0',
            'rgb(189, 176, 176)',
        );
    });

    it('Should be able to use color picker input and change Link and Button Styles', () => {
        // # Change "Link Color" and verify color change
        verifyColorPickerChange(
            'Link and Button Styles',
            '#linkColor-squareColorIcon',
            '#linkColor-inputColorValue',
            '#linkColor-squareColorIconValue',
            '#EEF8FF',
            'rgb(238, 248, 255)',
        );
    });
});

function verifyColorPickerChange(stylesText, iconButtonId, inputId, iconValueId, hexValue, rgbValue) {
    // # Open styles section
    cy.findByText(stylesText).scrollIntoView().should('be.visible').click({force: true});

    // # Click the Sidebar BG setting
    cy.get(iconButtonId).click();

    // # Click the 15, 40 coordinate of color popover
    cy.get('.color-popover').should('be.visible').click(15, 40);

    // # Click the Sidebar BG setting again to close popover
    cy.get(iconButtonId).click();

    // # Toggle theme colors the custom theme
    cy.get('#standardThemes').scrollIntoView().should('be.visible').check().should('be.checked');
    cy.get('#customThemes').scrollIntoView().should('be.visible').check().should('be.checked');

    // # Re-open styles section
    cy.findByText(stylesText).scrollIntoView().should('be.visible').click({force: true});

    // * Verify input box has new hex value
    cy.get(inputId).should('be.visible').and('have.value', hexValue);

    // * Verify color change is applied correctly
    cy.get(iconValueId).should('be.visible').and('have.css', 'background-color', rgbValue);
}
