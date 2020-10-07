// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @integrations

import * as TIMEOUTS from '../../../fixtures/timeouts';

let testTeam;

describe('Integrations', () => {
    before(() => {
        // # Create test team, channel, and webhook
        cy.apiInitSetup().then(({team}) => {
            testTeam = team;

            // # Visit the webhook page
            cy.visit(`/${team.name}/integrations/outgoing_webhooks/add`);
        });
    });

    it('MM-T617 Delete outgoing webhook', () => {
        // # Create an outgoing webhook with trigger word "testing"
        cy.get('#displayName', {timeout: TIMEOUTS.ONE_MIN}).type('New Outgoing Webhook');
        cy.get('#description').type('Description');
        cy.get('#channelSelect').select('Town Square');
        cy.get('#triggerWords').type('testing');
        cy.get('#callbackUrls').type('https://outgoing-webhook-01snptsk6qvz.runkit.sh/');
        cy.get('#saveWebhook').click();

        //# Return to app and confirm outgoing webhook is working
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.uiPostMessageQuickly('testing');
        cy.uiWaitUntilMessagePostedIncludes('Outgoing Webhook Payload');

        // # Delete the webhook
        cy.visit(`/${testTeam.name}/integrations/outgoing_webhooks`);
        cy.findAllByText('Delete').click();
        cy.get('#confirmModalButton').click();

        //# Return to app and confirm trigger word no longer works
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.uiPostMessageQuickly('testing');

        // Wait for BOT message
        cy.wait(TIMEOUTS.TWO_SEC);
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).should('not.contain', 'Outgoing Webhook Payload');
        });
    });
});
