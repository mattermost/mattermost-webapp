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

import * as TIMEOUTS from '../../fixtures/timeouts';
import users from '../../fixtures/users.json';
import {getMessageMenusPayload} from '../../utils';

const options = [
    {text: 'Option 1', value: 'option1'},
    {text: 'Option 2', value: 'option2'},
    {text: 'Option 3', value: 'option3'},
];
const payload = getMessageMenusPayload({options});

let channelId;
let incomingWebhook;

describe('MM-15887 Interactive menus - basic options', () => {
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

        // # Visit '/' and create incoming webhook
        cy.visit('/');
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

    it('matches elements', () => {
        // # Post an incoming webhook
        cy.postIncomingWebhook({url: incomingWebhook.url, data: payload});

        // # Get message attachment from the last post
        cy.getLastPostId().then((postId) => {
            cy.get(`#messageAttachmentList_${postId}`).as('messageAttachmentList');
        });

        // * Verify each element of message attachment list
        cy.get('@messageAttachmentList').within(() => {
            cy.get('.attachment__thumb-pretext').should('be.visible').and('have.text', 'This is attachment pretext with basic options');
            cy.get('.post-message__text-container').should('be.visible').and('have.text', 'This is attachment text with basic options');
            cy.get('.attachment-actions').should('be.visible');
            cy.get('.select-suggestion-container').should('be.visible');
            cy.get('.select-suggestion-container > input').should('be.visible').and('have.attr', 'placeholder', 'Select an option...');

            cy.get('#suggestionList').should('not.be.visible');
            cy.get('.select-suggestion-container > input').click();
            cy.get('#suggestionList').should('be.visible').children().should('have.length', options.length);

            cy.get('#suggestionList').children().each(($el, index) => {
                cy.wrap($el).should('have.text', options[index].text);
            });

            // * Close suggestion list by clicking on other element
            cy.get('.attachment__thumb-pretext').click();
        });
    });

    it('displays selected option and posts ephemeral message', () => {
        // # Post an incoming webhook
        cy.postIncomingWebhook({url: incomingWebhook.url, data: payload});

        // # Get message attachment from the last post
        cy.getLastPostId().then((postId) => {
            cy.get(`#messageAttachmentList_${postId}`).as('messageAttachmentList');
        });

        cy.get('@messageAttachmentList').within(() => {
            // # Select option 1 by typing exact text and press enter
            cy.get('.select-suggestion-container > input').click().clear().type(`${options[0].text}{enter}`);

            // * Verify that the input is updated with the selected option
            cy.get('.select-suggestion-container > input').should('be.visible').and('have.attr', 'value', options[0].text);
        });

        cy.wait(TIMEOUTS.SMALL);

        cy.getLastPostId().then((postId) => {
            // * Verify that ephemeral message is posted, visible to observer and contains an exact message
            cy.get(`#${postId}_message`).should('be.visible').and('have.class', 'post--ephemeral');
            cy.get('.post__visibility').should('be.visible').and('have.text', '(Only visible to you)');
            cy.get(`#postMessageText_${postId}`).should('be.visible').and('have.text', 'Ephemeral | select  option: option1');
        });
    });

    it('displays reply in center channel with "commented on [user\'s] message: [text]"', () => {
        const user1 = users['user-1'];

        // # Post an incoming webhook
        cy.postIncomingWebhook({url: incomingWebhook.url, data: payload});

        // # Get last post
        cy.getLastPostId().then((parentMessageId) => {
            const baseUrl = Cypress.config('baseUrl');

            // # Post another message
            cy.postMessageAs({sender: user1, message: 'Just another message', channelId, baseUrl});

            // # Click comment icon to open RHS
            cy.clickPostCommentIcon(parentMessageId);

            // * Check that the RHS is open
            cy.get('#rhsContainer').should('be.visible');

            // # Have another user reply to the webhook message
            cy.postMessageAs({sender: user1, message: 'Reply to webhook', channelId, rootId: parentMessageId, baseUrl});

            // # Get the latest post
            cy.getLastPostId().then((replyMessageId) => {
                // * Verify that the reply is in the channel view with matching text
                cy.get(`#post_${replyMessageId}`).within(() => {
                    cy.get('.post__link').should('be.visible').and('have.text', 'Commented on webhook\'s message: This is attachment pretext with basic options');
                    cy.get(`#postMessageText_${replyMessageId}`).should('be.visible').and('have.text', 'Reply to webhook');
                });

                // * Verify that the reply is in the RHS with matching text
                cy.get(`#rhsPost_${replyMessageId}`).within(() => {
                    cy.get('.post__link').should('not.be.visible');
                    cy.get(`#postMessageText_${replyMessageId}`).should('be.visible').and('have.text', 'Reply to webhook');
                });
            });
        });
    });
});
