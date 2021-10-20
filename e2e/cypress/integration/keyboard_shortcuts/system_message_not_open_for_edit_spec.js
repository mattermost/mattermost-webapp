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

    it('MM-T1265 UP - System message does not open for edit; opens previous regular message', () => {
        const message = 'Test message';
        const newHeader = 'New Header';
        cy.apiLogin(testUser);

        // # Visit the channel using the channel name
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Post message in the channel from User
        cy.postMessage(message);

        // # Change the header of the channel to generate a system message
        cy.get('.setHeaderButton').click();

        // * Verify that the Edit Post Modal is visible
        cy.get('.modal-content').should('be.visible');

        // * Type new header
        cy.get('[data-testid=edit_textbox]').type(newHeader);

        // * Click save button to change header this generates a system message
        cy.get('.save-button').click();

        // # Press UP arrow
        cy.get('#post_textbox').type('{uparrow}');

        // * Verify that the Edit Post Modal is visible
        cy.get('#editPostModal').should('be.visible');

        cy.findByRole('textbox', {name: 'edit the post...'}).should('have.text', message);
    });
});
