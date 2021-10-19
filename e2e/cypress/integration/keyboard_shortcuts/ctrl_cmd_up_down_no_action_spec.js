// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @keyboard_shortcuts

describe('Keyboard Shortcuts', () => {
    let testTeam;
    let testChannel;
    let testUser;
    before(() => {
        cy.apiInitSetup().then(({team, channel, user}) => {
            testTeam = team;
            testChannel = channel;
            testUser = user;
        });
    });

    it('MM-T1255 CTRL/CMD+UP or DOWN no action on draft post', () => {
        const message = 'Test message from User 1';
        cy.apiLogin(testUser);

        // # Visit the channel using the channel name
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Type a message in the input box but do not post it
        cy.get('#post_textbox').type(message);

        // # Press CMD/CTRL+DOWN arrow
        cy.get('#post_textbox').cmdOrCtrlShortcut('{downarrow}');

        // * Check the focus after pressing CTRL/CMD + DOWN then check match the text and the cursor position respectively
        cy.get('#post_textbox').
            should('be.focused').
            and('have.text', message).
            and('have.prop', 'selectionStart', message.length).
            and('have.prop', 'selectionEnd', message.length);

        // # Press CMD/CTRL+UP arrow
        cy.get('#post_textbox').cmdOrCtrlShortcut('{uparrow}');

        // * Check the focus after pressing CTRL/CMD + DOWN then check match the text and the cursor position respectively
        cy.get('#post_textbox').
            should('be.focused').
            and('have.text', message).
            and('have.prop', 'selectionStart', 0).
            and('have.prop', 'selectionEnd', 0);
    });
});
