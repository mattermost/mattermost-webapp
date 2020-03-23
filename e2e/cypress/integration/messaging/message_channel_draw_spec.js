// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging @plugin

/**
 * Note : This test requires draw plugin tar file under fixtures folder.
 * Download from : https://integrations.mattermost.com/draw-plugin/
 * Copy to : ./e2e/cypress/fixtures/com.mattermost.draw-plugin.tar.gz
 */

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Draw plugin : Post message', () => {
    const pluginId = 'com.mattermost.draw-plugin';

    before(() => {
        // # Login as sysadmin and update config
        cy.apiLogin('sysadmin');
        cy.apiUpdateConfig({
            PluginSettings: {
                Enable: true,
                RequirePluginSignature: false,
            },
        });

        // # Upload and enable Draw plugin
        cy.uploadBinaryFileByName('com.mattermost.draw-plugin.tar.gz').then(() => {
            cy.enablePluginById(pluginId);

            // # Login as user-1 and go to town-square channel
            cy.apiLogin('user-1');
            cy.visit('/ad-1/channels/town-square');
            cy.get('#post_textbox').clear().type('This check is for draw plugin');
        });
    });

    after(() => {
        // # UnInstall Draw plugin
        cy.apiLogin('sysadmin');
        cy.uninstallPluginById(pluginId);
    });

    it('M11759-Draw plugin : Post message check for Draw Plugin & My Computer events', () => {
        //Assertion 1 : Upload image via draw plugin and check Message doesn't post

        // # Open file upload options - Select draw plugin
        cy.get('#fileUploadButton').click();
        cy.get('#fileUploadOptions').findByText('Draw').click();

        // * upload a file and verify drafted message still exist in textbox
        cy.get('canvas').trigger('pointerdown').trigger('pointerup').click();
        cy.findByText('Upload').should('be.visible').click();
        cy.get('#post_textbox').
            should('be.visible').wait(TIMEOUTS.TINY).
            should('have.text', 'This check is for draw plugin');

        //Assertion 2 :Cancel draw plugin upload and check Message doesn't post

        // # Open file upload options - Select draw plugin
        cy.get('#fileUploadButton').click();
        cy.get('#fileUploadOptions').findByText('Draw').click();

        // * Cancel the file upload process and verify drafted message still exist in textbox
        cy.findByText('Cancel').should('be.visible').click();
        cy.get('#post_textbox').
            should('be.visible').wait(TIMEOUTS.TINY).
            should('have.text', 'This check is for draw plugin');

        //Assertion 3 : click on Your Computer and check message doesn't post

        // # Open file upload options - Select your computer plugin
        cy.get('#fileUploadButton').click();
        cy.get('#fileUploadOptions').findByText('Your computer').click();

        // * Click on my computer and verify drafted message still exist in textbox
        cy.get('#post_textbox').should('be.visible').wait(TIMEOUTS.TINY).
            should('have.text', 'This check is for draw plugin');
    });
});
