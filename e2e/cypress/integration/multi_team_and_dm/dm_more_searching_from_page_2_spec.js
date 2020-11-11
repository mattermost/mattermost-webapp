// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @multi_team_and_dm

describe('Multi Team and DM', () => {
    let testChannel;
    let testTeam;
    let testUser;
    let searchTerm;

    before(() => {
        // # Setup with the new team, channel and user
        cy.apiInitSetup().then(({team, channel, user}) => {
            testTeam = team;
            testChannel = channel;
            testUser = user;
            searchTerm = user.username;

            // # Create 52 users so the user must page forward in the dm list
            Cypress._.times(52, () => {
                cy.apiCreateUser({prefix: 'atestuser'}).then(() => {
                    cy.apiAddUserToTeam(testTeam.id, user.id);
                });
            });

            // # Login with testUser and visit test channel
            cy.apiLogin(testUser);
            cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
        });
    });

    it('MM-T446 DM More... searching from page 2 of user list', () => {
        // # Open the Direct Message modal
        cy.findByLabelText('write a direct message').click();

        // # Move to the next page of users
        cy.get('button[class*="next"]').click().then(() => {
            // # Enter a search term
            cy.get('#selectItems').click().type(searchTerm).then(() => {
                // * Assert that the previous / next links do not appear
                cy.get('button[class*="next"]').should('not.exist');
                cy.get('button[class*="previous"]').should('not.exist');

                // * Assert that the search term does not return wrong user(s)
                cy.get('span[id*="testuser"]').should('not.be.visible');

                // * Assert that the search term returns the correct user
                cy.get('span[id*="displayedUserName"]').should('contain', searchTerm);
            });
        });
    });
});
