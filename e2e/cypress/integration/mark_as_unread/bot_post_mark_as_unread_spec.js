
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @mark_as_unread

import {getAdminAccount} from '../../support/env';
import {beUnread} from '../../support/assertions';

import {markAsUnreadFromPost, verifyPostNextToNewMessageSeparator} from './helpers';

describe('Bot post unread message', () => {
    const sysadmin = getAdminAccount();
    let newChannel;
    let botPost;

    before(() => {
        // # Set ServiceSettings to expected values
        const newSettings = {
            ServiceSettings: {
                EnableBotAccountCreation: true,
            },
        };
        cy.apiUpdateConfig(newSettings);

        // # Create and visit new channel
        cy.apiInitSetup().then(({team, channel}) => {
            newChannel = channel;
            cy.visit(`/${team.name}/channels/${channel.name}`);
        });

        // # Create a bot and get userID
        cy.apiCreateBot('bot-' + Date.now(), 'Test Bot', 'test bot for E2E test replying to older bot post').then(({bot}) => {
            const botUserId = bot.user_id;
            cy.externalRequest({user: sysadmin, method: 'put', path: `users/${botUserId}/roles`, data: {roles: 'system_user system_post_all system_admin'}});

            // # Get token from bots id
            cy.apiAccessToken(botUserId, 'Create token').then(({token}) => {
                //# Add bot to team
                cy.apiAddUserToTeam(newChannel.team_id, botUserId);

                // # Post message as bot to the new channel
                cy.postBotMessage({token, channelId: newChannel.id, message: 'this is bot message'}).then((res) => {
                    botPost = res.data;
                });
            });
        });
    });

    it('MM-T252 bot post unread', () => {
        // # Mark the bot post as unread
        markAsUnreadFromPost(botPost);

        // * Verify the channel is unread in LHS
        cy.get(`#sidebarItem_${newChannel.name}`).should(beUnread);

        // * Verify the notification separator line exists and present before the unread message
        verifyPostNextToNewMessageSeparator('this is bot message');
    });
});
