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

import TIMEOUTS from '../../fixtures/timeouts';

let channel;
let incomingWebhook;

describe('Interactive Menu', () => {
    before(() => {
        cy.requireWebhookServer();

        // # Login as sysadmin
        cy.apiLogin('sysadmin');

        // Set required ServiceSettings
        const newSettings = {
            ServiceSettings: {
                AllowedUntrustedInternalConnections: 'localhost',
                EnablePostUsernameOverride: true,
                EnablePostIconOverride: true,
            },
        };
        cy.apiUpdateConfig(newSettings);

        // # Update teammate name display setting is set to default 'username'
        cy.apiSaveTeammateNameDisplayPreference('username');
        cy.apiSaveMessageDisplayPreference('clean');

        // # Create and visit new channel and create incoming webhook
        cy.createAndVisitNewChannel().then((data) => {
            channel = data;

            const newIncomingHook = {
                channel_id: channel.id,
                channel_locked: true,
                description: 'Incoming webhook interactive menu',
                display_name: 'menuIn' + Date.now(),
            };

            cy.apiCreateWebhook(newIncomingHook).then((hook) => {
                incomingWebhook = hook;
            });
        });
    });

    it('should parse text into Slack-compatible markdown depending on "skip_slack_parsing" property on response', () => {
        const payload = getPayload(Cypress.env().webhookBaseUrl);

        // # Post an incoming webhook
        cy.postIncomingWebhook({url: incomingWebhook.url, data: payload});

        // # Click on "Skip Parsing" button
        cy.findByText('Skip Parsing').should('be.visible').click({force: true});
        cy.wait(TIMEOUTS.TINY);

        // * Verify that it renders original "spoiler" text
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('have.html', '<p>a &lt; a | b &gt; a</p>');
        });

        // # Click on "Do Parsing" button
        cy.findByText('Do Parsing').should('be.visible').click({force: true});
        cy.wait(TIMEOUTS.TINY);

        // * Verify that it renders markdown with link
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('have.html', '<p>a <a class="theme markdown__link" href="http://a" rel="noreferrer" target="_blank"> b </a> a</p>');
        });
    });
});

function getPayload(webhookBaseUrl) {
    return {
        attachments: [{
            pretext: 'Slack-compatible interactive message response',
            actions: [{
                name: 'Skip Parsing',
                integration: {
                    url: `${webhookBaseUrl}/slack_compatible_message_response`,
                    context: {
                        action: 'show_spoiler',
                        spoiler: 'a < a | b > a',
                        skipSlackParsing: true,
                    },
                }
            }, {
                name: 'Do Parsing',
                integration: {
                    url: `${webhookBaseUrl}/slack_compatible_message_response`,
                    context: {
                        action: 'show_spoiler',
                        spoiler: 'a < a | b > a',
                        skipSlackParsing: false,
                    },
                },
            }],
        }],
    };
}
