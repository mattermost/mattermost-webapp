// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @account_setting

import * as TIMEOUTS from '../../../../fixtures/timeouts';
import {hexToRgbArray, rgbArrayToString} from '../../../../utils';

describe('Account Settings', () => {
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

    it('MM-T280_1 Theme Colors - Color Picker (Sidebar styles)', () => {
        // # Change "Sidebar BG" and verify color change
        verifyColorPickerChange(
            'Sidebar Styles',
            '#sidebarBg-squareColorIcon',
            '#sidebarBg-inputColorValue',
            '#sidebarBg-squareColorIconValue',
        );
    });

    it('MM-T280_2 Theme Colors - Color Picker (Center Channel styles)', () => {
        // # Change "Center Channel BG" and verify color change
        verifyColorPickerChange(
            'Center Channel Styles',
            '#centerChannelBg-squareColorIcon',
            '#centerChannelBg-inputColorValue',
            '#centerChannelBg-squareColorIconValue',
        );
    });

    it('MM-T280_3 Theme Colors - Color Picker (Link and Button styles)', () => {
        // # Change "Link Color" and verify color change
        verifyColorPickerChange(
            'Link and Button Styles',
            '#linkColor-squareColorIcon',
            '#linkColor-inputColorValue',
            '#linkColor-squareColorIconValue',
        );
    });
});

function verifyColorPickerChange(stylesText, iconButtonId, inputId, iconValueId) {
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

    // * Verify color change is applied correctly
    cy.get(inputId).scrollIntoView().should('be.visible').invoke('attr', 'value').then((hexColor) => {
        const rbgArr = hexToRgbArray(hexColor);
        cy.get(iconValueId).should('be.visible').and('have.css', 'background-color', rgbArrayToString(rbgArr));
    });
}
