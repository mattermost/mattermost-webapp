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
    before(() => {

        let testTeam;
        let testChannel;
        let team_id;

        //const callbackUrl = `${Cypress.env().webhookBaseUrl}/post_outgoing_webhook`;

        //cy.requireWebhookServer();

        // # Create test team, channel, and webhook
        cy.apiInitSetup().then(({team, channel}) => {
            testTeam = team;
            testChannel = channel;

            const newOutgoingHook = {
            team_id: team.id,
            channel_id: channel.id,
            display_name: "New Outgoing Webhook",
            trigger_words: "testing",
            callback_urls: callbackUrl
            }
            
            //cy.apiCreateWebhook(newOutgoingHook, false);

            // # Visit the webhook page
            cy.visit(`/${team.name}/integrations/outgoing_webhooks`, {timeout: TIMEOUTS.ONE_MIN});
        });
    });

    it('MM-T617 Delete outgoing webhook', () => {
        //cy.visit(`/${team.name}/integrations/outgoing_webhooks`, {timeout: TIMEOUTS.ONE_MIN});

        // # Create an outgoing webhook with trigger word "testing"
        //cy.get('#displayName', {timeout: TIMEOUTS.ONE_MIN}).type('New Outgoing Webhook');
        //cy.get('#description').type('Description');
        //cy.get('#channelSelect').select('Town Square');
        //cy.get('#triggerWords').type('testing');
        //cy.get('#callbackUrls').type('https://outgoing-webhook-01snptsk6qvz.runkit.sh/');
        //cy.get('#saveWebhook').click();

        //# Return to app and confirm outgoing webhook is working
        //cy.visit(`/${testTeam.name}/channels/town-square`);
        //cy.uiPostMessageQuickly('testing', {timeout: TIMEOUTS.ONE_MIN});
        //cy.uiWaitUntilMessagePostedIncludes('Outgoing Webhook Payload');

        // # Delete the webhook
        //cy.visit(`/${testTeam.name}/integrations/outgoing_webhooks`);
        //cy.findAllByText('Delete', {timeout: TIMEOUTS.ONE_MIN}).click();
        //cy.get('#confirmModalButton').click();

        //# Return to app and confirm trigger word no longer works
        //cy.visit(`/${testTeam.name}/channels/town-square`);
        //cy.uiPostMessageQuickly('testing', {timeout: TIMEOUTS.ONE_MIN});

        // Wait for BOT message
        //cy.wait(TIMEOUTS.TWO_SEC);
        //cy.getLastPostId().then((lastPostId) => {
          //  cy.get(`#${lastPostId}_message`).should('not.contain', 'Outgoing Webhook Payload');
        });
    });
