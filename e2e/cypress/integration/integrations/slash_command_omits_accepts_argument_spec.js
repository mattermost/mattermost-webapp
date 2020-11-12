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

    it('MM-T2832 Use a slash command that omits accepts an optional argument', () => {
        const todaysDate = Cypress.moment().format('MMMDD');
        const testText = 'meeting agenda items';

        // * Suggestion list is visible after typing "/agenda " with space character
        cy.findByTestId('post_textbox').type(`/agenda queue ${testText}{enter}`);
        cy.uiWaitUntilMessagePostedIncludes(`${testText}`).then(() => {
            cy.getLastPostId().then((postId) => {
                cy.get(`#postMessageText_${postId}`).within(() => {
                    cy.contains(`${testChannel.name}-${todaysDate} 1) ${testText}`);
                });
            });
        });
    });
});
