// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @integrations

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Integrations', () => {
    let testTeam;
    let testChannel;
    let testUser;

    before(() => {
        const callbackUrl = `${Cypress.env().webhookBaseUrl}/post_outgoing_webhook`;

        cy.requireWebhookServer();

        // # Create test team, channel, and webhook
        cy.apiInitSetup().then(({team, channel, user}) => {
            testTeam = team.name;
            testChannel = channel.name;
            testUser = user;

            const newOutgoingHook = {
                team_id: team.id,
                display_name: 'New Outgoing Webhook',
                trigger_words: ['testing'],
                callback_urls: [callbackUrl],
            };

            cy.apiCreateWebhook(newOutgoingHook, false);
            cy.visit(`/${testTeam}/integrations/outgoing_webhooks`);
        });
    });

    it('MM-T612 Regenerate token', () => {
        // # Grab generated token
        let generatedToken;
        cy.get('.item-details__token').then((number1) => {
            generatedToken = number1.text().split(' ').pop();
            cy.apiLogin(testUser);
            cy.visit(`/${testTeam}/channels/${testChannel}`);

            // Post message and assert token is present in test message
            cy.uiPostMessageQuickly('testing', {timeout: TIMEOUTS.ONE_MIN});
            cy.uiWaitUntilMessagePostedIncludes(generatedToken);
        });

        // # Regenerate the token
        cy.apiAdminLogin();
        cy.visit(`/${testTeam}/integrations/outgoing_webhooks`);
        cy.findAllByText('Regenerate Token').click();

        // Grab regenerated token
        let regeneratedToken;
        cy.get('.item-details__token').then((number2) => {
            regeneratedToken = number2.text().split(' ').pop();

            //# Post a message and confirm regenerated token appears
            cy.apiLogin(testUser);
            cy.visit(`/${testTeam}/channels/${testChannel}`);
            cy.uiPostMessageQuickly('testing', {timeout: TIMEOUTS.ONE_MIN});
            cy.uiWaitUntilMessagePostedIncludes(regeneratedToken).should('does.not', generatedToken);
        });
    });
});
