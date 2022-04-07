// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @dev
// Group: @incoming_webhook

import {enableUsernameAndIconOverride} from './helpers';
import {generateRandomUser} from '../../../support/api/user';

describe('Incoming webhook', () => {
    const incomingWebhookText = "This is a message to a newly created direct message channel";
    let incomingWebhookConfiguration;
    let incomingWebhook;
    let generatedTeam;
    let generatedChannel;
    let generatedUser;
    let generatedUserPassword;

    before(() => {
      // # Enable username override
      enableUsernameAndIconOverride(true, false);

      // # Create a new user, their team, and a channel to tie the webhook to
      cy.apiInitSetup({userPrefix: "mm-t639-"}).then(({team, channel, user}) => {
          generatedTeam = team;
          generatedChannel = channel;
          generatedUser = user;
          incomingWebhookConfiguration = {
              channel_id: channel.id,
              channel_locked: false,
              display_name: 'webhook',
          };
          cy.apiCreateWebhook(incomingWebhookConfiguration).then((hook) => {
              incomingWebhook = hook;
          });
      });
    });

    it('MM-T639 🚀 incoming Webhook creates DM', () => {
        // # Send webhook notification
        const webhookPayload = {channel: `@${generatedUser.username}`, text: incomingWebhookText};
        cy.postIncomingWebhook({url: incomingWebhook.url, data: webhookPayload});

        // # Verify that the message was posted correctly
        cy.visit(`/${generatedTeam.name}/channels/${generatedChannel.name}`);
        // TODO assertions
    });
});
