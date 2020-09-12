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
 * Note: This test requires draw plugin tar file under fixtures folder.
 * Download from: https://integrations.mattermost.com/draw-plugin/
 * Copy to: ./e2e/cypress/fixtures/com.mattermost.draw-plugin.tar.gz
 */

import * as TIMEOUTS from '../../fixtures/timeouts';
import {getRandomId} from '../../utils';

describe('M17448 Does not post draft message', () => {
    const pluginId = 'com.mattermost.draw-plugin';

    before(() => {
        // # Update config
        cy.apiUpdateConfig({
            PluginSettings: {
                Enable: true,
                RequirePluginSignature: false,
            },
        });

        // # Upload and enable "Draw" plugin
        cy.apiUploadPlugin('com.mattermost.draw-plugin.tar.gz').then(() => {
            cy.apiEnablePluginById(pluginId);

            // # Login as test user and visit town-square
            cy.apiInitSetup({loginAfter: true}).then(({team}) => {
                cy.visit(`/${team.name}/channels/town-square`);
            });
        });
    });

    after(() => {
        // # Uninstall "Draw" plugin
        cy.apiAdminLogin();
        cy.apiRemovePluginById(pluginId);
    });

    it('on successful upload via "Draw" plugin', () => {
        const draft = `Draft message ${getRandomId()}`;
        cy.get('#post_textbox').clear().type(draft);

        // # Open file upload options and select draw plugin
        cy.get('#fileUploadButton').click();
        cy.get('#fileUploadOptions').findByText('Draw').click();

        // * Upload a file and verify drafted message still exist in textbox
        cy.get('canvas').trigger('pointerdown').trigger('pointerup').click();
        cy.findByText('Upload').should('be.visible').click();
        cy.get('#post_textbox').
            should('be.visible').wait(TIMEOUTS.HALF_SEC).
            should('have.text', draft);
    });

    it('on upload cancel via "Draw" plugin', () => {
        const draft = `Draft message ${getRandomId()}`;
        cy.get('#post_textbox').clear().type(draft);

        // # Open file upload options and select draw plugin
        cy.get('#fileUploadButton').click();
        cy.get('#fileUploadOptions').findByText('Draw').click();

        // * Cancel file upload process and verify drafted message still exist in textbox
        cy.findByText('Cancel').should('be.visible').click();
        cy.get('#post_textbox').
            should('be.visible').wait(TIMEOUTS.HALF_SEC).
            should('have.text', draft);
    });

    it('on upload attempt via "Your Computer', () => {
        const draft = `Draft message ${getRandomId()}`;
        cy.get('#post_textbox').clear().type(draft);

        // # Open file upload options and select "Your Computer"
        cy.get('#fileUploadButton').click();
        cy.get('#fileUploadOptions').findByText('Your computer').click();

        // * Verify drafted message still exist in textbox
        cy.get('#post_textbox').should('be.visible').wait(TIMEOUTS.HALF_SEC).
            should('have.text', draft);
    });
});
