// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// <reference path="../support/index.d.ts" />

import * as TIMEOUTS from '../../fixtures/timeouts';

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @system_console @plugin

/**
 * Note : This test requires the demo plugin tar file under fixtures folder.
 * Download from : https://github.com/mattermost/mattermost-plugin-demo/releases/download/v0.9.0/com.mattermost.demo-plugin-0.9.0.tar.gz
 * Copy to : ./e2e/cypress/fixtures/com.mattermost.demo-plugin-0.9.0.tar.gz
 */

describe('Plugins Management', () => {
    const pluginID = 'com.mattermost.demo-plugin';
    const pluginFile = 'com.mattermost.demo-plugin-0.9.0.tar.gz';

    before(() => {
        cy.apiInitSetup();

        cy.apiRemovePluginById(pluginID);
    });

    after(() => {
        cy.apiRemovePluginById(pluginID);
    });

    it('MM-T2400 Plugins Management', () => {
        // Visit the plugin management page
        cy.visit('/admin_console/plugins/plugin_management');

        const mimeType = 'application/gzip';
        cy.fixture(pluginFile, 'binary').
            then(Cypress.Blob.binaryStringToBlob).
            then((fileContent) => {
                cy.get('input[type=file]').attachFile({fileContent, fileName: pluginFile, mimeType});
            });

        // # Upload plugin
        cy.get('#uploadPlugin').scrollIntoView().should('be.visible').click().wait(TIMEOUTS.HALF_SEC);

        // * Verify initial disabled state after upload
        cy.findByTestId(pluginID, {timeout: TIMEOUTS.FIVE_MIN}).scrollIntoView().should('be.visible').within(() => {
            cy.findByText('Enable').should('be.visible');
            cy.findByText('Remove').should('be.visible');
            cy.findByText('This plugin is not enabled.').should('be.visible');
        });

        // * Reload browser to make plugin's Settings appear
        cy.reload();

        cy.findByTestId(pluginID, {timeout: TIMEOUTS.ONE_MIN}).scrollIntoView().should('be.visible').within(() => {
            // * Verify disabled state
            cy.findByText('Enable').should('be.visible');
            cy.findByText('Remove').should('be.visible');
            cy.findByText('Settings').should('be.visible');
            cy.findByText('This plugin is not enabled.').should('be.visible');

            // # Enable plugin
            cy.findByText('Enable').should('be.visible').click();

            // * Verify enabling state
            cy.findByText('Enabling...', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
            cy.findByText('This plugin is starting.').should('be.visible');

            // * Verify enabled state
            cy.findByText('This plugin is running.', {timeout: TIMEOUTS.FIVE_MIN}).should('be.visible');

            // # Disable plugin
            cy.findByText('Disable').should('be.visible').click();

            // * Verify final disabled state
            cy.findByText('This plugin is stopping.', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
            cy.findByText('This plugin is not enabled.', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
            cy.findByText('Enable').should('be.visible');
        });
    });
});
