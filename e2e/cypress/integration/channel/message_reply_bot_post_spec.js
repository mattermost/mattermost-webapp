// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../fixtures/users.json';

const sysadmin = users.sysadmin;
describe('Messaging', () => {
    let newChannel;
    let botsUserId;
    let botName;
    let botToken;
    let yesterdaysDate;
    before(() => {
        // # Set ServiceSettings to expected values
        const newSettings = {
            ServiceSettings: {
                EnableBotAccountCreation: true,
            },
        };
        cy.apiUpdateConfig(newSettings);

        // # Login as sysadmin
        cy.apiLogin('sysadmin');
        cy.apiSaveTeammateNameDisplayPreference('username');

        // # Create and visit new channel
        cy.createAndVisitNewChannel().then((channel) => {
            newChannel = channel;
        });
    });

    it('M16735 - Replying to an older bot post that has no post content and no attachment pretext', () => {
        // # Get yesterdays date in UTC
        yesterdaysDate = Cypress.moment().subtract(1, 'days').valueOf();
        botName = 'bot-' + Date.now();

        // # Create a bot and get userID
        cy.apiCreateBot(botName, 'Test Bot', 'test bot for E2E test replying to older bot post').then((response) => {
            botsUserId = response.body.user_id;
            cy.externalRequest({user: sysadmin, method: 'put', path: `users/${botsUserId}/roles`, data: {roles: 'system_user system_post_all system_admin'}});

            // # Get token from bots id
            cy.apiAccessToken(botsUserId, 'Create token').then((token) => {
                botToken = token;

                //# Add bot to team
                cy.apiAddUserToTeam(newChannel.team_id, botsUserId);

                // # Post message with auth token
                const props = {attachments: [{text: 'Some Text posted by bot that has no content and no attachment pretext'}]};
                cy.postBotMessage({token: botToken, props, channelId: newChannel.id, createAt: yesterdaysDate}).
                    its('id').
                    should('exist').
                    as('yesterdaysBotPost');
            });
        });

        // # Add two subsequent posts
        cy.postMessage('First posting');
        cy.postMessage('Another one Posted');

        cy.get('@yesterdaysBotPost').then((postId) => {
            // # Open RHS comment menu
            cy.clickPostCommentIcon(postId);

            // # Reply to message
            cy.postMessageReplyInRHS('A reply to an older post bot post');

            // # Get the latest reply post
            cy.getLastPostId().then((replyId) => {
                // * Verify that the reply is in the RHS with matching text
                cy.get(`#rhsPost_${replyId}`).within(() => {
                    cy.queryByTestId('post-link').should('not.be.visible');
                    cy.get(`#rhsPostMessageText_${replyId}`).should('be.visible').and('have.text', 'A reply to an older post bot post');
                });

                cy.get(`#CENTER_time_${postId}`).find('time').invoke('attr', 'title').then((originalTimeStamp) => {
                    // * Verify the first post timestamp equals the RHS timestamp
                    cy.get(`#RHS_ROOT_time_${postId}`).find('time').invoke('attr', 'title').should('be', originalTimeStamp);

                    // * Verify the first post timestamp was not modified by the reply
                    cy.get(`#CENTER_time_${replyId}`).find('time').should('have.attr', 'title').and('not.equal', originalTimeStamp);
                });

                //# Close RHS
                cy.closeRHS();

                // * Verify that the reply is in the channel view with matching text
                cy.get(`#post_${replyId}`).within(() => {
                    cy.queryByTestId('post-link').should('be.visible').and('have.text', 'Commented on ' + botName + '\'s message: Some Text posted by bot that has no content and no attachment pretext');
                    cy.get(`#postMessageText_${replyId}`).should('be.visible').and('have.text', 'A reply to an older post bot post');
                });
            });
        });

        // # Verify RHS is closed
        cy.get('#rhsContainer').should('not.be.visible');
    });
    it('MM-16734 Reply to an older bot post that has some attachment pretext', () => {
        // # Get yesterdays date in UTC
        yesterdaysDate = Cypress.moment().subtract(1, 'days').valueOf();
        botName = 'bot-' + Date.now();

        // # Create a bot and get userID
        cy.apiCreateBot(botName, 'Test Bot', 'test bot for E2E test replying to older bot post').then((response) => {
            botsUserId = response.body.user_id;
            cy.externalRequest({user: sysadmin, method: 'put', path: `users/${botsUserId}/roles`, data: {roles: 'system_user system_post_all system_admin'}});

            // # Get token from bots id
            cy.apiAccessToken(botsUserId, 'Create token').then((token) => {
                botToken = token;

                //# Add bot to team
                cy.apiAddUserToTeam(newChannel.team_id, botsUserId);

                // # Post message with auth token
                const message = 'Hello message from ' + botName;
                const props = {attachments: [{pretext: 'Some Pretext', text: 'Some Text'}]};
                cy.postBotMessage({token: botToken, message, props, channelId: newChannel.id, createAt: yesterdaysDate}).
                    its('id').
                    should('exist').
                    as('yesterdaysPost');
            });
        });

        // # Add two subsequent posts
        cy.postMessage('First post');
        cy.postMessage('Another Post');

        cy.get('@yesterdaysPost').then((postId) => {
            // # Open RHS comment menu
            cy.clickPostCommentIcon(postId);

            // # Reply to message
            cy.postMessageReplyInRHS('A reply to an older post with message attachment');

            // # Get the latest reply post
            cy.getLastPostId().then((replyId) => {
                // * Verify that the reply is in the RHS with matching text
                cy.get(`#rhsPost_${replyId}`).within(() => {
                    cy.queryByTestId('post-link').should('not.be.visible');
                    cy.get(`#rhsPostMessageText_${replyId}`).should('be.visible').and('have.text', 'A reply to an older post with message attachment');
                });

                cy.get(`#CENTER_time_${postId}`).find('time').invoke('attr', 'title').then((originalTimeStamp) => {
                    // * Verify the first post timestamp equals the RHS timestamp
                    cy.get(`#RHS_ROOT_time_${postId}`).find('time').invoke('attr', 'title').should('be', originalTimeStamp);

                    // * Verify the first post timestamp was not modified by the reply
                    cy.get(`#CENTER_time_${replyId}`).find('time').should('have.attr', 'title').and('not.equal', originalTimeStamp);
                });

                //# Close RHS
                cy.closeRHS();

                // * Verify that the reply is in the channel view with matching text
                cy.get(`#post_${replyId}`).within(() => {
                    cy.queryByTestId('post-link').should('be.visible').and('have.text', 'Commented on ' + botName + '\'s message: Hello message from ' + botName);
                    cy.get(`#postMessageText_${replyId}`).should('be.visible').and('have.text', 'A reply to an older post with message attachment');
                });
            });
        });

        // # Verify RHS is closed
        cy.get('#rhsContainer').should('not.be.visible');
    });
});
