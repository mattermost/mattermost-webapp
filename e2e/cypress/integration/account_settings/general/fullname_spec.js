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
    let testUser;
    let otherUser;
    let offTopicUrl;

    before(() => {
        cy.apiInitSetup().then(({team, user, offTopicUrl: url}) => {
            testUser = user;
            offTopicUrl = url;

            cy.apiCreateUser().then(({user: user1}) => {
                otherUser = user1;
                cy.apiAddUserToTeam(team.id, otherUser.id);
            });
        });
    });

    it('MM-T183 Filtering by first name with Korean characters', () => {
        const randomId = getRandomId();
        const newFirstName = `정트리나${randomId}/trina.jung/집단사무국(CO)`;

        // # Login as test user, visit off-topic and go to the Account Settings
        cy.apiLogin(testUser);
        cy.visit(offTopicUrl);
        cy.uiOpenAccountSettingsModal();

        // # Open Full Name section
        cy.get('#nameDesc').click();

        // # Set first name value
        cy.get('#firstName').clear().type(newFirstName);

        // # Save form
        cy.uiSave();

        const {username} = testUser;

        cy.apiLogin(otherUser);
        cy.visit(offTopicUrl);

        // # Type in user's first name substring
        cy.get('#post_textbox').clear().type(`@${newFirstName.substring(0, 11)}`);

        // * Verify that the testUser is selected from mention autocomplete
        cy.uiVerifyAtMentionSuggestion({...testUser, first_name: newFirstName}, true);

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

    it('MM-T2043 Enter first name', () => {
        cy.apiLogin(testUser);
        cy.visit(offTopicUrl);

        cy.uiOpenAccountSettingsModal();

        // # Click "Edit" to the right of "Full Name"
        cy.get('#nameEdit').should('be.visible').click();

        // # Clear the first name
        cy.get('#firstName').clear();

        // # Type a new first name
        cy.get('#firstName').should('be.visible').type(testUser.first_name + '_new');

        // # Save the settings
        cy.uiSave();

        // * Check that the first name was correctly updated
        cy.get('#nameDesc').should('be.visible').should('contain', testUser.first_name + '_new ' + testUser.last_name);
    });
});
