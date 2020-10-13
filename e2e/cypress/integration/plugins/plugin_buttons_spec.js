// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/**
 * Note: This test requires test and demo plugin tar file under fixtures folder.
 * Download from: https://github.com/mattermost/mattermost-plugin-test/releases/download/v0.1.0/com.mattermost.test-plugin-0.1.0.tar.gz
 * Copy to: ./e2e/cypress/fixtures/com.mattermost.test-plugin-0.1.0.tar.gz
 *
 * Download version 0.1.0 from :
 * https://github.com/mattermost/mattermost-plugin-demo/releases/download/v0.2.0/com.mattermost.demo-plugin-0.2.0.tar.gz
 * Copy to : ./e2e/cypress/fixtures/com.mattermost.demo-plugin-0.2.0.tar.gz
 */

describe('collapse on 5 plugin buttons', () => {
    let testTeam;

    beforeEach(() => {
        // # Set plugin settings
        const newSettings = {
            PluginSettings: {
                Enable: true,
                RequirePluginSignature: false,
            },
        };
        cy.apiUpdateConfig(newSettings);

        // # Login as Admin
        cy.apiInitSetup().then(({team}) => {
            testTeam = team;
        });
        cy.apiAdminLogin();
    });

    it('MM-T1649 Greater than 5 plugin buttons collapse to one icon in top nav', () => {
        // # Go to town square
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Try to remove test plugin, just in case
        cy.apiRemovePluginById('com.mattermost.test-plugin');

        // # Try to remove demo plugin, just in case
        cy.apiRemovePluginById('com.mattermost.demo-plugin');

        // # Upload and enable test plugin with 5 channel header icons
        cy.apiUploadPlugin('com.mattermost.test-plugin-0.1.0.tar.gz').then(() => {
            cy.apiEnablePluginById('com.mattermost.test-plugin');
        });

        // * Validate that there are 10 channel header icons
        cy.get('.channel-header__icon').should('have.length', 10);

        // # Upload and enable demo plugin with one additional channel header icon
        cy.apiUploadPlugin('com.mattermost.demo-plugin-0.2.0.tar.gz').then(() => {
            cy.apiEnablePluginById('com.mattermost.demo-plugin');
        });

        // * Validate that channel header icons collapsed and there are only 6
        cy.get('.channel-header__icon').should('have.length', 6);

        // * Validate that plugin count is 6
        cy.get('#pluginCount').should('have.text', 6);
    });
});
