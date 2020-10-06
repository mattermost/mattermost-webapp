// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @integrations

describe('Integrations', () => {
    before(() => {
        // # Create test team, channel, and webhook
        cy.apiInitSetup().then(({team, channel}) => {
            const newIncomingHook = {
                channel_id: channel.id,
                channel_locked: true,
                description: 'Test Webhook Description',
                display_name: 'Test Webhook Name',
            };

            //# Create a new webhook
            cy.apiCreateWebhook(newIncomingHook);

            // # Visit the webhook page
            cy.visit(`/${team.name}/integrations/incoming_webhooks`);
        });
    });

    it('MM-T640 Cancel out of edit', () => {
        //# Click Delete
        cy.findByText('Delete').click();

        //# Click Cancel
        cy.findByText('Cancel').click();

        // # Assert the webhook is still present
        cy.findAllByText('Test Webhook Name').should('be.visible');
        cy.findAllByText('Test Webhook Description').should('be.visible');
        cy.findByText('Delete').should('be.visible');
    });
});
