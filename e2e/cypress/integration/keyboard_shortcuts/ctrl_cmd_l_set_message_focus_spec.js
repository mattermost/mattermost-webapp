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

    it('MM-T1249 CTRL/CMD+SHIFT+L - Set focus to center channel message box (with REPLY RHS open)', () => {
        cy.postMessage('Hello World!');

        cy.getLastPostId().then((postId) => {
            // # Open RHS
            cy.clickPostDotMenu(postId);
            cy.findByText('Reply').click();

            // * Confirm that reply text box has focus
            cy.get('#reply_textbox').should('be.focused');

            // * Confirm the RHS is shown
            cy.get('#rhsCloseButton').should('exist');

            // # Press CTRL/CMD+SHIFT+L
            cy.get('body').cmdOrCtrlShortcut('{shift}L');

            // * Confirm the message box has focus
            cy.get('#post_textbox').should('be.focused');
        });
    });
});
