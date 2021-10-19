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
        cy.apiInitSetup({loginAfter: true}).then(({channelUrl}) => {
            // # Visit a test channel
            cy.visit(channelUrl);
        });
    });

    it('MM-T1251 CTRL/CMD+SHIFT+L - When not to set focus to center channel message box', () => {

        // # Open account settings modal
        cy.get('[aria-label="Select to open the settings modal."]').click();
        // # Press ctrl/cmd+shift+l
        cy.get('body').cmdOrCtrlShortcut('{shift+l}');
        // * check if channel message box is focused
        cy.get('[data-testid=post_textbox]').should('not.be.focused');
        // # close account settings modal
        cy.get('#accountSettingsHeader > .close > [aria-hidden="true"]').click();
        // # open invite members full-page screen
        cy.get('#introTextInvite').click();
        // # Press ctrl/cmd+shift+l
        cy.get('body').cmdOrCtrlShortcut('{shift+l}');
        // * check if channel message box is focused
        cy.get('[data-testid=post_textbox]').should('not.be.focused');
        // # close invite memebers full-page screen
        cy.get('#closeIcon > svg').click();
    });
});
