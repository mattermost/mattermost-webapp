// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * Note : This test requires draw plugin tar file under fixtures folder.
 * Download from : https://integrations.mattermost.com/draw-plugin/
 * Copy to : ./e2e/cypress/fixtures/com.mattermost.draw-plugin.tar.gz
 */

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Draw plugin : Post message', () => {
    const pluginId = 'com.mattermost.draw-plugin';

    beforeEach(() => {
        // # Login as sysadmin
        cy.apiLogin('sysadmin');

        // # Enable Plugin
        // # Disable Require Plugin Signature
        cy.apiUpdateConfig({
            PluginSettings: {
                Enable: true,
                RequirePluginSignature: false,
            },
        });

        // # UnInstall Draw plugin
        cy.apiLogin('sysadmin');
        cy.uninstallPluginById(pluginId);

        // # Upload and enable Draw plugin
        cy.uploadBinaryFileByName('com.mattermost.draw-plugin.tar.gz').then(() => {
            cy.enablePluginById(pluginId);

            // # Login as user-1 and go to town-square channel
            cy.apiLogin('user-1');
            cy.visit('/ad-1/channels/town-square');
            cy.get('#post_textbox').clear().type('This check is for draw plugin');
        });
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
        cy.get('#fileUploadOptions', {timeout: TIMEOUTS.SMALL}).findByText('Your computer').click();

        // * Click on my computer and verify drafted message still exist in textbox
        cy.get('#post_textbox').should('be.visible').wait(TIMEOUTS.TINY).
            should('have.text', 'This check is for draw plugin');
    });
});
