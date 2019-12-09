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

let channelId;
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
            channelId = id;

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
        
    });
});