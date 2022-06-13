// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../../fixtures/timeouts';

export function addNewCommand(team, trigger, url) {
    // # Add new command
    cy.get('#addSlashCommand').click();

    // # Type a trigger word, url and display name
    cy.get('#trigger').type(`${trigger}`);
    cy.get('#displayName').type('Test Message');
    cy.apiGetChannelByName(team.name, 'town-square').then(({channel}) => {
        let urlToType = url;
        if (url === '') {
            urlToType = `${Cypress.env('webhookBaseUrl')}/send_message_to_channel?channel_id=${channel.id}`;
        }
        cy.get('#url').type(urlToType);

        // # Save
        cy.get('#saveCommand').click();

        // * Verify we are at setup successful URL
        cy.url().should('include', '/integrations/commands/confirm');

        // * Verify slash was successfully created
        cy.findByText('Setup Successful').should('exist').and('be.visible');

        // * Verify token was created
        cy.findByText('Token').should('exist').and('be.visible');
    });
}

export function runSlashCommand(team, trigger) {
    // # Go back to home channel
    cy.visit(`/${team.name}/channels/town-square`);

    // # Run slash command
    cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').clear().type(`/${trigger}{enter}{enter}`);
    cy.wait(TIMEOUTS.TWO_SEC);

    // # Get last post message text
    cy.getLastPostId().then((postId) => {
        cy.get(`#post_${postId}`).get('.Badge').contains('BOT');
    });
}
