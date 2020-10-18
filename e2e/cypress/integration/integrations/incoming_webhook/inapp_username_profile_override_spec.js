// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @incoming_webhook

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Incoming webhook', () => {
    let testTeam;
    let testChannel;
    let siteName;
    let sysadmin;
    let incomingWebhook;

    before(() => {
        cy.apiGetMe().then(({user}) => {
            sysadmin = user;
        });

        cy.apiUpdateConfig({
            ServiceSettings: {
                EnablePostUsernameOverride: true,
                EnablePostIconOverride: true,
            },
        }).then(({config}) => {
            siteName = config.TeamSettings.SiteName;
        });

        // # Create and visit new channel and create incoming webhook
        cy.apiInitSetup().then(({team, channel}) => {
            testTeam = team;
            testChannel = channel;

            const newIncomingHook = {
                channel_id: channel.id,
                channel_locked: true,
                description: 'Incoming webhook - in-app override',
                display_name: 'in-app-override',
            };

            cy.apiCreateWebhook(newIncomingHook).then((hook) => {
                incomingWebhook = hook;
            });
        });
    });

    it('MM-T620 Payload username and profile picture override in-app settings', () => {
        // # Edit incoming webhook
        cy.visit(`/${testTeam.name}/integrations/incoming_webhooks/edit?id=${incomingWebhook.id}`);
        cy.get('.backstage-header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').within(() => {
            cy.findByText('Incoming Webhooks').should('be.visible');
            cy.findByText('Edit').should('be.visible');
        });

        // # Enter username and profile icon URL
        const inAppUsername = 'in-app';
        const inAppIconURL = 'https://pbs.twimg.com/profile_images/3303520670/4da3468b30495a5d73e6f31df068e5c9.jpeg';
        cy.findByLabelText('Username').should('exist').type(inAppUsername);
        cy.findByLabelText('Profile Picture').should('exist').type(inAppIconURL);

        // # CLick update and verify ot redirects to incoming webhook page
        cy.findByText('Update').click();
        cy.url().should('include', `/${testTeam.name}/integrations/incoming_webhooks`).wait(TIMEOUTS.ONE_SEC);

        // # Click back to site and verify that it redirects to town-square channel
        cy.findByText(`Back to ${siteName}`).click();
        cy.url().should('include', `/${testTeam.name}/channels/town-square`);

        // # Post an incoming webhook
        const payload = getPayload(testChannel);
        cy.postIncomingWebhook({url: incomingWebhook.url, data: payload});

        // # Click test channel and verify last post
        cy.get(`#sidebarItem_${testChannel.name}`).should('be.visible').click();
        cy.getLastPost().within(() => {
            // * Verify that the username is overridden per webhook payload
            cy.get('.post__header').find('.user-popover').as('usernameForPopover').should('have.text', payload.username);

            // * Verify that the user icon is overridden per webhook payload
            const baseUrl = Cypress.config('baseUrl');
            const encodedIconUrl = encodeURIComponent(payload.icon_url);
            cy.get('.profile-icon > img').as('profileIconForPopover').should('have.attr', 'src', `${baseUrl}/api/v4/image?url=${encodedIconUrl}`);

            // * Verify that the BOT label appears
            cy.get('.Badge').should('be.visible').and('have.text', 'BOT');

            // * Verify that there's no status indicator
            cy.get('.status').should('not.exist');
        });

        // # Click on username and verify profile popover
        cy.get('@usernameForPopover').click();
        verifyProfilePopover(sysadmin, payload);

        // # Click away to close propfile popover
        cy.get('body').click();

        // # Click on profile icon and verify profile popover
        cy.get('@profileIconForPopover').click();
        verifyProfilePopover(sysadmin, payload);
    });
});

function getPayload(channel) {
    return {
        channel: channel.name,
        username: 'payload_username',
        text: 'This is from incoming webhook',
        icon_url: 'http://www.mattermost.org/wp-content/uploads/2016/04/icon_WS.png',
    };
}

function verifyProfilePopover(owner, payload) {
    // * Verify that the profile popover is shown
    cy.get('#user-profile-popover').should('be.visible').within(() => {
        // * Verify username from payload
        cy.get('.user-popover__username').should('be.visible').and('have.text', payload.username);

        // * Verify icon URL from payload
        cy.get('.Avatar').should('have.attr', 'src', payload.icon_url);

        // * Verify that it matches with correct footer
        cy.get('.popover__row').should('be.visible').and('have.text', `This post was created by an integration from @${owner.username}`);
    });
}
