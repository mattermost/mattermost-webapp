// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @keyboard_shortcuts

describe('Keyboard Shortcuts', () => {
    before(() => {
        cy.apiInitSetup().then(({channelUrl}) => {
            cy.visit(channelUrl);
        });
    });

    it('MM-T4441_1 CTRL/CMD+A - Settings should open in desktop view', () => {
        // # Type CTRL/CMD+A to open 'Settings'
        cy.get('#post_textbox').cmdOrCtrlShortcut('A');

        // * Ensure account settings modal is open
        cy.get('#accountSettingsModal').should('be.visible');

        cy.uiClose();
    });

    it('MM-T4441_2 CTRL/CMD+A - Settings should open in mobile view view', () => {
        // # Resize the window to mobile view
        cy.viewport('iphone-6');

        // # Type CTRL/CMD+A to open 'Settings'
        cy.get('#post_textbox').cmdOrCtrlShortcut('A');

        // * Ensure Settings modal is open
        cy.get('#accountSettingsModal').should('be.visible');

        cy.uiClose();
    });
});
