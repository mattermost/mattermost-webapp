// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @keyboard_shortcuts

describe('Keyboard Shortcuts', () => {
    let testUser;
    let testTeam;
    let publicChannel;

    before(() => {
        cy.apiInitSetup({loginAfter: true}).then(({team, channel, user}) => {
            // # Visit a test channel
            testTeam = team;
            publicChannel = channel;
            testUser = user;

            cy.visit(`/${team.name}/channels/${channel.name}`);
        });
    });

    it('Pressing the backspace key without an input focused should not send the browser back in history', () => {
        // # Navigate to a couple of pages
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.visit(`/${testTeam.name}/channels/off-topic`);
        cy.visit(`/${testTeam.name}/channels/${publicChannel.name}`);
        cy.visit(`/${testTeam.name}/channels/off-topic`);

        cy.visit(`/${testTeam.name}/messages/@${testUser.username}`);
        cy.url().should('include', `/${testTeam.name}/messages/@${testUser.username}`);

        // click on the body to remove focus from the input key
        cy.get('#post_textbox').clear().type('This is a normal sentence.').type('{backspace}{backspace}').blur();
        cy.get('body').type('{backspace}');
        cy.get('body').type('{backspace}');

        // Verify that the URL doesn't change from the last URL
        cy.url().should('include', `/${testTeam.name}/messages/@${testUser.username}`);
    });
});
