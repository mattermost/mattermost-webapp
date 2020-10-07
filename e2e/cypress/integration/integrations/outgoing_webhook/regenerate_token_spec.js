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
        cy.get('#doneButton').click()

        // # Grab token 1
        let generatedToken;
        cy.get('.item-details__token').then((number1) => {
            generatedToken = number1.text().split(' ').pop();
        });

        //# Return to app and confirm outgoing webhook is working
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.uiPostMessageQuickly(`${generatedToken}`)
        cy.uiPostMessageQuickly('testing');
        cy.uiWaitUntilMessagePostedIncludes(generatedToken);

        // # Delete the webhook
        cy.visit(`/${testTeam.name}/integrations/outgoing_webhooks`);
        cy.findAllByText('Regenerate Token').click();

        // # Grab token 2
        let regeneratedToken;
        cy.get('.item-details__token > span').then((number2) => {
            regeneratedToken = number2.text().split(' ').pop();
        });

        //# Return to app and confirm regenerated token works
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.uiPostMessageQuickly('testing');
        cy.uiWaitUntilMessagePostedIncludes(regeneratedToken);

        // Wait for BOT message
        //cy.wait(TIMEOUTS.TWO_SEC);
        //cy.getLastPostId().then((lastPostId) => {
        //    cy.get(`#${lastPostId}_message`).should('not.contain', 'Outgoing Webhook Payload');
        
    });
});