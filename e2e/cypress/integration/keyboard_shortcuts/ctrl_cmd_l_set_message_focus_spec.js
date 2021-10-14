// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @keyboard_shortcuts

describe('Keyboard Shortcuts', () => {
    let testUser;

    before(() => {
        cy.apiInitSetup({loginAfter: true}).then(({team, channel, user}) => {
            // # Visit a test channel
            testUser = user;
            cy.visit(`/${team.name}/channels/${channel.name}`);
        });
    });

    it('MM-T1249 CTRL/CMD+SHIFT+L - Set focus to center channel message box (with REPLY RHS open)', () => {
        cy.apiLogin(testUser);
        cy.postMessage('Hello World!');

        cy.getLastPostId().then((postId) => {
            // # Open RHS
            cy.clickPostDotMenu(postId);
            cy.findByText('Reply').click();

            cy.get('#rhsContainer').click();

            // * Confirm the RHS is shown
            cy.get('#rhsCloseButton').should('exist');
            cy.get('body').cmdOrCtrlShortcut('{shift}L');
            cy.get('#post_textbox').should('be.focused');
        });
    });
});
