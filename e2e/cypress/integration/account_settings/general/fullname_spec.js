// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @account_setting

import {getRandomId} from '../../../utils';

describe('Account Settings > Sidebar > General', () => {
    const randomId = getRandomId();
    const newFirstName = `정트리나${randomId}/trina.jung/집단사무국(CO)`;

    let testTeam;
    let testUser;
    let otherUser;

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;
            testTeam = team;

            cy.apiCreateUser().then(({user: user1}) => {
                otherUser = user1;
                cy.apiAddUserToTeam(testTeam.id, otherUser.id);
            });

            // # Login as test user, visit town-square and go to the Account Settings
            cy.apiLogin(testUser);
            cy.visit(`/${team.name}/channels/town-square`);
            cy.toAccountSettingsModal();

            // # Click General button
            cy.get('#generalButton').click();

            // # Open Full Name section
            cy.get('#nameDesc').click();

            // # Set first name value
            cy.get('#firstName').clear().type(newFirstName);

            // # Save form
            cy.get('#saveSetting').click();
        });
    });

    it('MM-T183 Filtering by first name with Korean characters', () => {
        const {username} = testUser;

        cy.apiLogin(otherUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Type in user's first name substring
        cy.get('#post_textbox').clear().type(`@${newFirstName.substring(0, 11)}`);

        // * Verify that the testUser is selected from mention autocomplete
        cy.uiVerifyAtMentionInSuggestionList('Channel Members', {...testUser, first_name: newFirstName}, true);

        // # Press tab on text input
        cy.get('#post_textbox').tab();

        // * Verify that after enter user's username match
        cy.get('#post_textbox').should('have.value', `@${username} `);

        // # Click enter in post textbox
        cy.get('#post_textbox').type('{enter}');

        // * Verify that message has been post in chat
        cy.get(`[data-mention="${username}"]`).
            last().
            scrollIntoView().
            should('be.visible');
    });
});

describe('Account Settings -> General -> Full Name', () => {
    let testUser;

    before(() => {
        cy.apiAdminLogin();

        // # Login as new user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team, user}) => {
            testUser = user;
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    beforeEach(() => {
        // # Go to Account Settings
        cy.toAccountSettingsModal();
    });

    it('MM-T2043 Enter first name', () => {
        // # Click "Edit" to the right of "Full Name"
        cy.get('#nameEdit').should('be.visible').click();

        // # Clear the first name
        cy.get('#firstName').clear();

        // # Type a new first name
        cy.get('#firstName').should('be.visible').type(testUser.first_name + '_new');

        // # Save the settings
        cy.get('#saveSetting').click();

        // * Check that the first name was correctly updated
        cy.get('#nameDesc').should('be.visible').should('contain', testUser.first_name + '_new ' + testUser.last_name);
    });
});
