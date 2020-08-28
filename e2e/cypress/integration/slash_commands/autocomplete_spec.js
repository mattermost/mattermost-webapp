// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @integrations

/**
 * Note : This test requires the demo plugin tar file under fixtures folder.
 * Download :
 * https://github.com/mattermost/mattermost-plugin-demo/releases/download/v0.8.0/com.mattermost.demo-plugin-0.8.0.tar.gz
 * Copy to : ./e2e/cypress/fixtures/com.mattermost.demo-plugin-0.8.0.tar.gz
 */

describe('Integrations', () => {
    const pluginIdDemo = 'com.mattermost.demo-plugin';

    before(() => {
        // # Initialize setup and visit town-square
        cy.apiInitSetup().then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);

            // # If Demo plugin is already enabled, uninstall it
            cy.apiRemovePluginById(pluginIdDemo);
        });

        const demoURL = 'https://github.com/mattermost/mattermost-plugin-demo/releases/download/v0.8.0/com.mattermost.demo-plugin-0.8.0.tar.gz';

        // # Install plugins from URL
        cy.apiInstallPluginFromUrl(demoURL);
    });

    after(() => {
        cy.apiRemovePluginById(pluginIdDemo);
    });

    it('T2834 Slash command help stays visible for system slash command', () => {
        // # Post a slash command without trailing space
        cy.get('#post_textbox').type('/rename');

        // * Verify suggestion list is visible
        cy.get('#suggestionList').should('be.visible');

        // * Verify command text is visible before space is added
        cy.get('.slash-command__desc').contains('Rename the channel').should('be.visible');

        // # Add trailing space to '/rename' command
        cy.get('#post_textbox').type(' ');

        // * Verify command text is no longer visible after space is added
        cy.findByText('Rename the channel').should('not.be.visible');

        // * Verify execute current command text shows
        cy.get('#suggestionList').findByText('Execute Current Command').should('be.visible');

        // * After typing the space character the relevant tip is still displayed
        cy.get('.slash-command__desc').contains('[text]').should('be.visible');
    });
});
