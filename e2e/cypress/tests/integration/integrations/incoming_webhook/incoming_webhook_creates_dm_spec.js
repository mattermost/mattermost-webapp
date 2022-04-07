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
    let teamTownSquareUrl;
    let sysAdminUser;
    let sortedUserIds;

    before(() => {
      cy.apiGetMe().then((me) => {
          sysAdminUser = me.user;
      });

      // # Enable username override
      enableUsernameAndIconOverride(true, false);

      // # Create a new user, their team, and a channel to tie the webhook to
      cy.apiInitSetup({userPrefix: "mm-t639-"}).then(({team, channel, user, channelUrl, offTopicUrl, townSquareUrl}) => {
          generatedTeam = team;
          generatedChannel = channel;
          generatedUser = user;
          teamTownSquareUrl = townSquareUrl;
          incomingWebhookConfiguration = {
              channel_id: channel.id,
              channel_locked: false,
              display_name: 'webhook',
          };
          cy.apiCreateWebhook(incomingWebhookConfiguration).then((hook) => {
              incomingWebhook = hook;
          });
      }).then(() => {
        // # Send webhook notification
        const webhookPayload = {channel: `@${generatedUser.username}`, text: incomingWebhookText};
        cy.postIncomingWebhook({url: incomingWebhook.url, data: webhookPayload});
      }).then(() => {
        // # Open any page to get to the sidebar
        cy.visit(`/${generatedTeam.name}/channels/${generatedChannel.name}`);
      });
    });

    it('MM-T639 🚀 incoming Webhook creates DM', () => {
        // # Verify that the channel was created correctly with an unread message, and open it
        cy.get(`a[href='/${generatedTeam.name}/messages/@${generatedUser.username}']`)
          .scrollIntoView()
          .should('be.visible')
          .should('have.class', 'unread-title')
          .click();

        // # Verify that the post matches our expectation
        cy.getLastPost()
          .should('be.visible')
          .get('.col__name > button.user-popover')
          .contains(incomingWebhookConfiguration.display_name);
        cy.getLastPost()
          .should('be.visible')
          .get('.col__name .BotBadge > span')
          .contains("BOT");
        cy.getLastPost()
          .get('.post-message__text')
          .contains(incomingWebhookText);
    });
});
