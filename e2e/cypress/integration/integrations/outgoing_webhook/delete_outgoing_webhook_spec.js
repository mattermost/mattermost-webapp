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
    let outgoingWebhook;

    //const callbackUrl = `${Cypress.env().webhookBaseUrl}/post_outgoing_webhook`;

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

            cy.apiCreateWebhook(newOutgoingHook, false).then((hook) => {
                outgoingWebhook = hook;

                cy.apiGetWebhook(outgoingWebhook.id, false).then((res) => {
                    expect(res.status).equal(200);
                    expect(res.body.id).equal(outgoingWebhook.id);
                });
            });

            cy.apiLogin(user);
        });
    });

    it('MM-T617 Delete outgoing webhook', () => {
        // # Confirm outgoing webhook is working
        cy.visit(`/${testTeam}/channels/${testChannel}`);
        cy.uiPostMessageQuickly('testing', {timeout: TIMEOUTS.ONE_MIN});
        cy.uiWaitUntilMessagePostedIncludes('Outgoing Webhook Payload');

        // # Delete the webhook
        cy.apiAdminLogin();

        // * Assert from API that outgoing webhook is active
        cy.apiGetWebhook(outgoingWebhook.id, false).then((res) => {
            expect(res.status).equal(200);
        });
        cy.visit(`/${testTeam}/integrations/outgoing_webhooks`);
        cy.findAllByText('Delete', {timeout: TIMEOUTS.ONE_MIN}).click();
        cy.get('#confirmModalButton').click();

        // * Assert the webhook has been deleted
        cy.findByText('No outgoing webhooks found').should('exist');
        cy.apiGetWebhook(outgoingWebhook.id, false).then((res) => {
            expect(res.status).equal(404);
        });

        // * Return to app and assert trigger word no longer works
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam}/channels/${testChannel}`);
        cy.uiPostMessageQuickly('testing', {timeout: TIMEOUTS.ONE_MIN});

        // * Assert bot message does not arrive
        cy.wait(TIMEOUTS.TWO_SEC);
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).should('not.contain', 'Outgoing Webhook Payload');
        });

        // * Verify from API that outgoing webhook has been deleted
        cy.apiAdminLogin();
        cy.apiGetWebhook(outgoingWebhook.id, false).then((res) => {
            expect(res.status).equal(404);
            expect(res.body.message).equal('Unable to get the webhook.');
        });
    });
});
