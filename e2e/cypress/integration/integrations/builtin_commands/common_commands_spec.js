// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @integrations

import * as TIMEOUTS from '../../../fixtures/timeouts';

import {loginAndVisitChannel} from './helper';

describe('Integrations', () => {
    let user1;
    let user2;
    let testChannelUrl;

    before(() => {
        cy.apiInitSetup({userPrefix: 'user1'}).then(({team, user}) => {
            user1 = user;
            testChannelUrl = `/${team.name}/channels/town-square`;

            cy.apiCreateUser({prefix: 'user2'}).then(({user: otherUser}) => {
                user2 = otherUser;

                cy.apiAddUserToTeam(team.id, user2.id);
            });
        });
    });

    it('MM-T573 / autocomplete list can scroll', () => {
        loginAndVisitChannel(user1, testChannelUrl);

        // # Clear post textbox
        cy.get('#post_textbox').clear().type('/');

        // * Suggestion list should be visible
        // # Scroll to bottom and verify that the last command "/shrug" is visible
        cy.get('#suggestionList', {timeout: TIMEOUTS.FIVE_SEC}).should('be.visible').scrollTo('bottom').then((container) => {
            cy.contains('/away', {container}).should('not.be.visible');
            cy.contains('/shrug [message]', {container}).should('be.visible');
        });

        // # Scroll to top and verify that the first command "/away" is visible
        cy.get('#suggestionList').scrollTo('top').then((container) => {
            cy.contains('/away', {container}).should('be.visible');
            cy.contains('/shrug [message]', {container}).should('not.be.visible');
        });
    });

    it('MM-T574 /shrug test', () => {
        // # Login as user2 and post a message
        loginAndVisitChannel(user2, testChannelUrl);
        cy.postMessage('hello from user2');

        // # Login as user1 and post "/shrug test"
        loginAndVisitChannel(user1, testChannelUrl);
        cy.postMessage('/shrug test{enter}');

        // * Verify that it posted message as expected from user1
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).find('.user-popover').should('have.text', user1.username);
            cy.get(`#postMessageText_${postId}`).should('have.text', 'test ¯\\_(ツ)_/¯');
        });

        // * Login as user2 and verify that it read the same message as expected from user1
        loginAndVisitChannel(user2, testChannelUrl);
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).find('.user-popover').should('have.text', user1.username);
            cy.get(`#postMessageText_${postId}`).should('have.text', 'test ¯\\_(ツ)_/¯');
        });
    });

    it('MM-T2345 /me on RHS', () => {
        loginAndVisitChannel(user1, testChannelUrl);
        cy.postMessage('test');

        // # Open RHS (reply thread)
        cy.clickPostCommentIcon();

        // # type /me test
        cy.get('#reply_textbox').type('/me test');
        cy.get('#addCommentButton').click();
        cy.uiWaitUntilMessagePostedIncludes('test');

        cy.getLastPostId().then((postId) => {
            // * Verify RHS message is from current user and properly formatted with lower opacity
            cy.get(`#rhsPost_${postId}`).should('have.class', 'current--user').within(() => {
                cy.get('button').should('have.text', user1.username);
                cy.get('p').should('have.text', 'test').and('have.css', 'color', 'rgba(61, 60, 64, 0.6)');
            });

            // * Verify message on the main channel is from current user and properly formatted with lower opacity
            cy.get(`#post_${postId}`).should('have.class', 'current--user').within(() => {
                cy.get('button').should('have.text', user1.username);
                cy.get('p').should('have.text', 'test').and('have.css', 'color', 'rgba(61, 60, 64, 0.6)');
            });
        });
    });

    it('MM-T710 /mute error message', () => {
        loginAndVisitChannel(user1, testChannelUrl);

        const invalidChannel = 'oppagangnamstyle';

        // # Type /mute with random characters
        cy.postMessage(`/mute ${invalidChannel}{enter}`);
        cy.uiWaitUntilMessagePostedIncludes('Please use the channel handle to identify channels');

        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).

                // * Could not find the channel "lalodkjngjrngorejng". Please use the channel handle to identify channels.
                should('have.text', `Could not find the channel ${invalidChannel}. Please use the channel handle to identify channels.`).

                // * Channel handle links to: https://docs.mattermost.com/help/getting-started/organizing-conversations.html#naming-a-channel
                contains('a', 'channel handle').then((link) => {
                    const href = link.prop('href');
                    cy.request(href).its('allRequestResponses').then((response) => {
                        cy.wrap(response[1]['Request URL']).should('equal', 'https://docs.mattermost.com/help/getting-started/organizing-conversations.html#naming-a-channel');
                    });
                });
        });
    });

    it('MM-T2834 Slash command help stays visible for system slash command', () => {
        // # Login as user 1 and visit default channel
        loginAndVisitChannel(user1, testChannelUrl);

        // # Type the rename slash command in textbox
        cy.get('#post_textbox').clear().type('/rename ');

        // # Scan inside of suggestion list
        cy.get('#suggestionList').should('exist').and('be.visible').within(() => {
            // * Verify that renaming part of rename autosuggestion is still
            // visible in the autocomplete, since [text] is same as description and title, we will check if title exists
            cy.findAllByText('[text]').first().should('exist');
        });

        // # Append Hello to /rename and hit enter
        cy.get('#post_textbox').type('Hello{enter}').wait(TIMEOUTS.HALF_SEC);
        cy.get('#post_textbox').invoke('text').should('be.empty');
    });
});
