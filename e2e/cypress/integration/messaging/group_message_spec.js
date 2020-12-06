// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

describe('Group Messages', () => {
    let testUser;
    let otherUser1;
    let otherUser2;

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;

            cy.apiCreateUser({prefix: 'otherA'}).then(({user: newUser}) => {
                otherUser1 = newUser;

                cy.apiAddUserToTeam(team.id, newUser.id);
            });

            cy.apiCreateUser({prefix: 'otherB'}).then(({user: newUser}) => {
                otherUser2 = newUser;

                cy.apiAddUserToTeam(team.id, newUser.id);
            });

            // # Login as test user and go to town square
            cy.apiLogin(testUser);
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T3319 Add GM', () => {
        // # Click on '+' sign to open DM modal
        cy.findByLabelText('write a direct message').should('be.visible').click();

        // * Verify that the DM modal is open
        cy.get('#moreDmModal').should('be.visible').contains('Direct Messages');

        // # Search for the user otherA
        cy.get('#selectItems input').should('be.enabled').type(`@${otherUser1.username}`, {force: true});

        // * Verify that the user is found and add to GM
        cy.get('#moreDmModal .more-modal__row').should('be.visible').and('contain', otherUser1.username).click({force: true});

        // # Search for the user otherB
        cy.get('#selectItems input').should('be.enabled').type(`@${otherUser2.username}`, {force: true});

        // * Verify that the user is found and add to GM
        cy.get('#moreDmModal .more-modal__row').should('be.visible').and('contain', otherUser2.username).click({force: true});

        // # Search for the current user
        cy.get('#selectItems input').should('be.enabled').type(`@${testUser.username}`, {force: true});

        // * Assert that it's not found
        cy.findByText('No items found').should('be.visible');

        // # Start GM
        cy.findByText('Go').click();

        // # Post something to create a GM
        cy.get('#post_textbox').type('Hi!').type('{enter}');

        // # Click on '+' sign to open DM modal
        cy.findByLabelText('write a direct message').should('be.visible').click();

        // * Verify that the DM modal is open
        cy.get('#moreDmModal').should('be.visible').contains('Direct Messages');

        // # Search for the user otherB
        cy.get('#selectItems input').should('be.enabled').type(`@${otherUser2.username}`, {force: true});

        // * Verify that the user is found and is part of the GM together with the other user
        cy.get('#moreDmModal .more-modal__row').should('be.visible').and('contain', otherUser2.username).and('contain', otherUser1.username);
    });
});
