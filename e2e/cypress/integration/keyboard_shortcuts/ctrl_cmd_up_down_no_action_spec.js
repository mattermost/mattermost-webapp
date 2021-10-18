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

        // # Post message in the channel from User 1
        cy.get('#post_textbox').type(message);

        // # Press CMD/CTRL+DOWN arrow and click to check cursor position
        cy.get('#post_textbox').cmdOrCtrlShortcut('{downarrow}');

        // * The post should have the same length as the typed text and
        // * it should have the same text, and the text should not change
        cy.get('#post_textbox').should('have.text', message);

        // # Press CMD/CTRL+UP arrow and click to check cursor position
        cy.get('#post_textbox').cmdOrCtrlShortcut('{uparrow}');

        // * The post should have the same length as the typed text and
        // * it should have the same text, and the text should not change
        cy.get('#post_textbox').should('have.text', message);
    });
});
