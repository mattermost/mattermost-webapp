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

import {getMessageButtonsPayload} from '../../utils';

const payload = getMessageButtonsPayload();

let incomingWebhook;

describe('Interactive Message: Button', () => {
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

    it('IM10164 - Include extra metadata when clicking an interactive button', () => {
        // # Post an incoming webhook
        cy.postIncomingWebhook({url: incomingWebhook.url, data: payload});

        // # Get message attachment from the last post
        let interactiveButtonPostId;
        cy.getLastPostId().then((postId) => {
            interactiveButtonPostId = postId;
            cy.get(`#messageAttachmentList_${postId}`).as('messageAttachmentList');
        });

        // * Verify each element of message attachment list and then click "Ephemeral" button
        cy.get('@messageAttachmentList').within(() => {
            cy.get('.attachment__thumb-pretext').should('be.visible').and('have.text', 'This is the attachment pretext.');
            cy.get('.post-message__text-container').should('be.visible').and('have.text', 'This is the attachment text for Interactive Message Buttons.');
            cy.findByText('Ephemeral Message').should('be.visible').click();
        }).then(() => {
            // * Verify metadata on click to "Ephemeral" button
            verifyMessage('Ephemeral', 'do_something_ephemeral', interactiveButtonPostId);
        });

        // * Verify "Update" button on message attachment list and then click
        cy.get('@messageAttachmentList').within(() => {
            cy.findByText('Update').should('be.visible').click();
        }).then(() => {
            // * Verify metadata on click to "Update" button
            verifyMessage('Update', 'do_something_update', interactiveButtonPostId);
        });
    });
});

function verifyMessage(action, context, interactiveButtonPostId) {
    cy.getLastPostId().then((postId) => {
        cy.get(`#postMessageText_${postId}`).should('be.visible').within(() => {
            cy.findByText(`${action} | context:`).should('be.visible');
            cy.getCurrentUserId().then((userId) => {
                cy.findByText(`user_id: "${userId}"`).should('be.visible');
                cy.findByText('user_name: "sysadmin"').should('be.visible');
            });
            cy.findByText('channel_name: "town-square"').should('be.visible');
            cy.apiGetChannelByName('ad-1', 'town-square').then((channel) => {
                cy.findByText(`channel_id: "${channel.id}"`).should('be.visible');
                cy.findByText('channel_name: "town-square"').should('be.visible');
                cy.findByText(`team_id: "${channel.team_id}"`).should('be.visible');
                cy.findByText('team_domain: "ad-1"').should('be.visible');
            });
            cy.findByText(`post_id: "${interactiveButtonPostId}"`).should('be.visible');
            cy.findByText(/trigger_id:/).should('be.visible');
            cy.findByText('type: ""').should('be.visible');
            cy.findByText('data_source: ""').should('be.visible');
            cy.findByText(`context: {"action":"${context}"}`).should('be.visible');
        });
    });
}
