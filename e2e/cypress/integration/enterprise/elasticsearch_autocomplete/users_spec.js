// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @elasticsearch @autocomplete @not_cloud

import {enableElasticSearch, getTestUsers} from './helpers';

describe('Autocomplete with Elasticsearch - Users', () => {
    const timestamp = Date.now();
    const testUsers = getTestUsers();
    let testTeam;

    before(() => {
        cy.shouldNotRunOnCloudEdition();

        // * Check if server has license for Elasticsearch
        cy.apiRequireLicenseForFeature('Elasticsearch');

        // # Enable Elasticsearch
        enableElasticSearch();

        // # Create new team for tests
        cy.apiCreateTeam(`elastic-${timestamp}`, `elastic-${timestamp}`).then(({team}) => {
            testTeam = team;

            // # Create pool of users for tests
            Cypress._.forEach(testUsers, (testUser) => {
                cy.apiCreateUser({user: testUser}).then(({user}) => {
                    cy.apiAddUserToTeam(testTeam.id, user.id);
                });
            });
        });
    });

    it('MM-T3863 Users in correct in/out of channel sections', () => {
        const thor = testUsers.thor;
        const loki = testUsers.loki;

        // # Create new channel and add user to channel
        const channelName = `new-channel-${timestamp}`;
        cy.apiCreateChannel(testTeam.id, channelName, channelName).then(({channel}) => {
            cy.apiGetUserByEmail(thor.email).then(({user}) => {
                cy.apiAddUserToChannel(channel.id, user.id);
            });

            cy.visit(`/${testTeam.name}/channels/${channel.name}`);
        });

        // # Start an at mention that should return 2 users (in this case, the users share a last name)
        cy.get('#post_textbox').
            as('input').
            should('be.visible').
            clear().
            type('@odinson');

        // * Thor should be a channel member
        cy.uiVerifyAtMentionInSuggestionList('Channel Members', thor, true);

        // * Loki should NOT be a channel member
        cy.uiVerifyAtMentionInSuggestionList('Not in Channel', loki, false);
    });

    it('MM-T2518 DM can be opened with a user not on your team or in your DM channel sidebar', () => {
        const thor = testUsers.thor;

        // # Open of the add direct message modal
        cy.uiAddDirectMessage().click();

        // # Type username into input
        cy.get('.more-direct-channels').
            find('input').
            should('exist').
            type(thor.username, {force: true});

        // * There should only be one result
        cy.get('.more-modal__row').
            as('result').
            its('length').
            should('equal', 1);

        // * Result should have appropriate text
        cy.get('@result').
            find('.more-modal__name').
            should('have.text', `@${thor.username} - ${thor.first_name} ${thor.last_name} (${thor.nickname})`);

        cy.get('@result').
            find('.more-modal__description').
            should('have.text', thor.email);

        // # Click on the result to add user
        cy.get('@result').click({force: true});

        // # Click on save
        cy.get('#saveItems').click();

        // * Should land on direct message channel for that user
        cy.get('#channelHeaderTitle').should('have.text', thor.username + ' ');
    });
});
