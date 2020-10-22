// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @integrations

describe('Integrations', () => {
    let testTeam;
    let testChannel;
    let testUser;

    before(() => {
        // # Create test team and channel
        cy.apiInitSetup().then(({team, channel, user}) => {
            testTeam = team.name;
            testChannel = channel.display_name;
            testUser = user;
        });
    });

    it('MM-T616 Copy icon for Outgoing Webhook token', () => {


        // Visit the integrations > add page
        cy.visit(`/${testTeam}/town_square`);
        cy.uiCreateChannel({prefix:'private-channel-', isPrivate: true});




        // * Assert that we are on the add page
        //cy.url().should('include', '/outgoing_webhooks/add');

        // # Manually set up an outgoing web-hook
        //cy.get('#displayName').type('test');
        //cy.get('#channelSelect').select(testChannel);
        //cy.get('#triggerWords').type('trigger');
        //cy.get('#callbackUrls').type('https://mattermost.com');
        //cy.get('#saveWebhook').click();

        // Assert that webhook was set up
        //cy.findByText('Setup Successful').should('be.visible');
    });
});
