// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../fixtures/timeouts';

import {
    getPostTextboxInput,
    getQuickChannelSwitcherInput,
    startAtMention,
    verifySuggestionAtChannelSwitcher,
    verifySuggestionAtPostTextbox,
} from './helpers';

export function doTestPostextbox(mention, ...suggestion) {
    getPostTextboxInput();
    startAtMention(mention);
    verifySuggestionAtPostTextbox(...suggestion);
}

export function doTestQuickChannelSwitcher(mention, ...suggestion) {
    getQuickChannelSwitcherInput();
    startAtMention(mention);
    verifySuggestionAtChannelSwitcher(...suggestion);
}

export function doTestUserChannelSection(prefix, testTeam, testUsers) {
    const thor = testUsers.thor;
    const loki = testUsers.loki;

    // # Create new channel and add user to channel
    const channelName = 'new-channel';
    cy.apiCreateChannel(testTeam.id, channelName, channelName).then(({channel}) => {
        cy.apiGetUserByEmail(thor.email).then(({user}) => {
            cy.apiAddUserToChannel(channel.id, user.id);
        });

        cy.visit(`/${testTeam.name}/channels/${channel.name}`);
    });

    // # Start an at mention that should return 2 users (in this case, the users share a last name)
    cy.wait(TIMEOUTS.HALF_SEC).get('#post_textbox').
        as('input').
        should('be.visible').
        clear().
        type(`@${prefix}odinson`);

    // * Thor should be a channel member
    cy.uiVerifyAtMentionInSuggestionList('Channel Members', thor, true);

    // * Loki should NOT be a channel member
    cy.uiVerifyAtMentionInSuggestionList('Not in Channel', loki, false);
}

export function doTestDMChannelSidebar(testUsers) {
    const thor = testUsers.thor;

    // # Open of the add direct message modal
    cy.uiAddDirectMessage().click({force: true});

    // # Type username into input
    cy.get('.more-direct-channels').
        find('input').
        should('exist').
        type(thor.username, {force: true});

    cy.intercept({
        method: 'POST',
        url: '/api/v4/users/search',
    }).as('searchUsers');

    cy.wait('@searchUsers').then((interception) => {
        expect(interception.response.body.length === 1);
    });

    // * There should only be one result
    cy.get('#moreDmModal').find('.more-modal__row').
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

    // # Should land on direct message channel for that user
    cy.get('#channelHeaderTitle').should('have.text', thor.username + ' ');
}
