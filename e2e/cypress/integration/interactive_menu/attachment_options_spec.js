// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/**
* Note: This test requires webhook server running. Initiate `npm run start:webhook` to start.
*/

import {getMessageMenusPayload} from '../../utils';
import * as TIMEOUT from '../../fixtures/timeouts';

let incomingWebhook;

describe('Interactive Menu', () => {
    before(() => {
        // Set required ServiceSettings
        const newSettings = {
            ServiceSettings: {
                AllowedUntrustedInternalConnections: 'localhost',
                EnablePostUsernameOverride: true,
                EnablePostIconOverride: true,
            },
        };
        cy.apiUpdateConfig(newSettings);

        // # Login as sysadmin and ensure that teammate name display setting is set to default 'username'
        cy.apiLogin('sysadmin');
        cy.apiSaveTeammateNameDisplayPreference('username');
        cy.apiSaveMessageDisplayPreference('clean');

        // # Visit '/' and create incoming webhook
        cy.visit('/ad-1/channels/town-square');
        cy.getCurrentChannelId().then((id) => {
            const newIncomingHook = {
                channel_id: id,
                channel_locked: true,
                description: 'Incoming webhook interactive menu',
                display_name: 'menuIn' + Date.now(),
            };

            cy.apiCreateWebhook(newIncomingHook).then((hook) => {
                incomingWebhook = hook;
            });
        });
    });

    it('IM21037 - Clicking in / Tapping on the message attachment menu box opens list of selections', () => {
        const menuOptions = [
            {text: 'Option 1', value: 'option1'},
            {text: 'Option 2', value: 'option2'},
            {text: 'Option 3', value: 'option3'},
        ];

        const menuOptionsPayload = getMessageMenusPayload({menuOptions});

        // # Create a message attachment with menu
        cy.postIncomingWebhook({url: incomingWebhook.url, data: menuOptionsPayload});

        // # Wait a little for webhook to arrive in chat
        cy.wait(TIMEOUT.TINY);

        // # Get the last posted message id
        cy.getLastPostId().then((lastPostId) => {
            // # Get the last messages attachment container
            cy.get(`#messageAttachmentList_${lastPostId}`).within(() => {
                // * Message attachment menu dropdown should be closed
                cy.get('#suggestionList').should('not.be.visible');

                // # Open the message attachment menu dropdown
                cy.get('#suggestion_box_container > input').click();

                // * Message attachment menu dropdown should now be open
                cy.get('#suggestionList').should('be.visible');

                // Loop through options
                cy.get('#suggestionList').children().each(($elem, index) => {
                // * Each dropdown should contain the options text in same order as webhook
                    cy.wrap($elem).should('have.text', menuOptions[index].text);
                });
            });
        });

        // # Close message attachment menu dropdown
        cy.get('body').click();
    });
});