// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @system_console @plugin

/**
 * Note : This test requires the gitlab plugin tar file under fixtures folder.
 * Download from :
 * https://github.com/mattermost/mattermost-plugin-gitlab/releases/download/v1.3.0/com.github.manland.mattermost-plugin-gitlab-1.3.0.tar.gz
 * Copy to : ./e2e/cypress/fixtures/com.github.manland.mattermost-plugin-gitlab-1.3.0.tar.gz
 */

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('If plugins fail to start, they can be disabled', () => {
    const pluginID = 'com.github.manland.mattermost-plugin-gitlab';
    const pluginFile = 'com.github.manland.mattermost-plugin-gitlab-1.3.0.tar.gz';

    before(() => {
        // # Initialize setup and visit town-square
        cy.apiInitSetup().then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);

            // If GitLab plugin is already installed, uninstall it
            cy.apiRemovePluginById(pluginID);
            cy.visit('/admin_console/plugins/plugin_management');
            cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Plugin Management');
        });
    });

    after(() => {
        cy.apiRemovePluginById(pluginID);
    });

    it('MM-T2391 If plugins fail to start, they can be disabled', () => {
        const mimeType = 'application/gzip';
        cy.fixture(pluginFile, 'binary').
            then(Cypress.Blob.binaryStringToBlob).
            then((fileContent) => {
                cy.get('input[type=file]').attachFile({fileContent, fileName: pluginFile, mimeType});
            });

        cy.get('#uploadPlugin').scrollIntoView().should('be.visible').click().wait(TIMEOUTS.HALF_SEC);

        // * Verify that the button shows correct text while uploading
        cy.findByText('Uploading...', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        // * Verify that the button shows correct text and is disabled after upload
        cy.findByText('Upload', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
        cy.get('#uploadPlugin').and('be.disabled');

        // # Enable GitLab plugin
        cy.findByTestId(pluginID).scrollIntoView().should('be.visible').within(() => {
            // * Verify GitLab Plugin title is shown
            cy.waitUntil(() => cy.get('strong').scrollIntoView().should('be.visible').then((title) => {
                return title[0].innerText === 'GitLab';
            }));

            // # Click on Enable link
            cy.findByText('Enable').click();
            cy.findByText('This plugin failed to start. Check your system logs for errors.').should('be.visible');

            cy.findByText('Disable').click();
            cy.findByText('This plugin is not enabled.').should('be.visible');
        });
    });
});
