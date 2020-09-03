// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @profile_popover

describe('Profile popover', () => {
    let testTeam;
    let testUser;

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;
            testUser = user;
        });
    });

    it('MM-T2 Add user — Error if already in channel', () => {
        // Login as test user and go to town square
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // Send multiple messages so that the profile popover appears completely.
        cy.postMessage('Hi there\nsending\na\nmessage');
        cy.apiLogout();

        // Login as sysadmin now
        cy.apiAdminLogin();
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // Open profile popover
        cy.get('#postListContent').within(() => {
            cy.findAllByText(testUser.username).first().should('have.text', testUser.username).click();
        });

        // Add to a Channel
        cy.findByText('Add to a Channel').click();

        cy.get('div[aria-labelledby="addChannelModalLabel"]').within(() => {
            // Type "Town"
            cy.get('input').should('be.visible').type('Town');

            // Click the channel
            cy.findByText('Town Square').should('be.visible').click();

            // Verify error message
            cy.get('#add-user-to-channel-modal__user-is-member').should('have.text', `${testUser.first_name} ${testUser.last_name} is already a member of that channel`);
        });
    });
});
