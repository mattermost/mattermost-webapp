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

    it('MM-T2833 Use a slash command that accepts an optional argument', () => {
        const nextWeek = Cypress.moment().add(7, 'days').format('MMMDD');
        const testText = 'meeting agenda items';

        // # Post a message with the plugin for a meeting in one week
        cy.findByTestId('post_textbox').type(`/agenda queue next-week ${testText}{enter}`);
        cy.uiWaitUntilMessagePostedIncludes(`${testText}`).then(() => {
            cy.getLastPostId().then((postId) => {
                cy.get(`#postMessageText_${postId}`).within(() => {
                    // * Assert that the agenda message is posted with date one week away with test text
                    cy.contains(`${testChannel.name}-${nextWeek} 1) ${testText}`);
                });
            });
        });
    });
});
