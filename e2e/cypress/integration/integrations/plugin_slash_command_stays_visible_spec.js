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

    before(() => {
        // # Login as test user and visit the newly created test channel
        cy.apiInitSetup().then(({team, user, channel}) => {
            testTeam = team;
            testChannel = channel;

            // # Set up and enable Agenda plugin required for test
            cy.apiInstallPluginFromUrl('https://github.com/mattermost/mattermost-plugin-agenda/releases/download/v0.2.1/com.mattermost.agenda-0.2.1.tar.gz', true);
            cy.apiEnablePluginById('com.mattermost.agenda');

            // # Login as regular user and visit test channel
            cy.apiLogin(user);
            cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
        });
    });

    after(() => {
        // # Clean up - remove Agenda plugin
        cy.apiAdminLogin();
        cy.apiRemovePluginById('com.mattermost.agenda');
    });

    it('MM-T2835 Slash command help stays visible for plugin', () => {
        // * Suggestion List is not visible
        cy.get('#suggestionList').should('not.exist').then(() => {
            // * Suggestion list is visible after typing "/agenda " with space character
            cy.findByTestId('post_textbox').type('/agenda ');
            cy.get('#suggestionList').should('be.visible');
        });
    });
});
