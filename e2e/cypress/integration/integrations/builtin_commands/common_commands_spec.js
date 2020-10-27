// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @integrations

import * as TIMEOUTS from '../../../fixtures/timeouts';

import {loginAndVisitChannel, verifyEphemeralMessage} from './helper';

describe('Integrations', () => {
    let user1;
    let user2;
    let testChannelUrl;
    let testTeam;

    before(() => {
        cy.apiInitSetup({userPrefix: 'user1'}).then(({team, user}) => {
            testTeam = team;
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

    it('MM-T678 /code', () => {
        loginAndVisitChannel(user1, testChannelUrl);

        // # Use "/code"
        cy.postMessage('/code 1. Not a list item, **not bolded**, http://notalink.com, ~off-topic is not a link to the channel.');

        // * Verify that that markdown isn't rendered
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).find('.user-popover').should('have.text', user1.username);
            cy.get(`#postMessageText_${postId}`).get('code').should('have.text', '1. Not a list item, **not bolded**, http://notalink.com, ~off-topic is not a link to the channel.');
        });

        // # Type "/code" with no text
        cy.postMessage('/code');

        // * Verify that an error message is shown
        verifyEphemeralMessage('A message must be provided with the /code command.');
    });

    it('MM-T679 /echo', () => {
        loginAndVisitChannel(user1, testChannelUrl);

        // # Type "/echo test 3"
        cy.postMessage('/echo test 3');

        // * Verify that that post is not shown after 1 second
        cy.wait(TIMEOUTS.ONE_SEC);
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('have.not.text', 'test');
        });

        // * Verify that that test 3 is posted after 3 seconds
        cy.wait(TIMEOUTS.TWO_SEC);
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).find('.user-popover').should('have.text', user1.username);
            cy.get(`#postMessageText_${postId}`).should('have.text', 'test');
        });
    });

    it('MM-T680 /help', () => {
        loginAndVisitChannel(user1, testChannelUrl, {
            onBeforeLoad: (win) => {
                cy.stub(win, 'open');
            },
        });

        // # Type "/help"
        cy.postMessage('/help');

        // * Verify that a new tag opens
        cy.window().its('open').should('have.been.calledWithMatch', 'https://about.mattermost.com/default-help/');
    });

    it('MM-T681 /invite_people error message with no text or text that is not an email address', () => {
        loginAndVisitChannel(user1, testChannelUrl);

        // # Type "/invite_people 123"
        cy.postMessage('/invite_people 123');

        // * Verify the message is shown saying "Please specify one or more valid email addresses"
        verifyEphemeralMessage('Please specify one or more valid email addresses');
    });

    it('MM-T682 /leave', () => {
        // # Go to Off-Topic
        loginAndVisitChannel(user1, `${testTeam.name}/channels/off-topic`);

        // # Type "/leave"
        cy.postMessage('/leave');

        // * Verity Off-Topic is not shown in LHS
        cy.get('#sidebarChannelContainer').should('be.visible').should('not.contain', 'Off-Topic');

        // * Verify user is redirected to Town Square
        cy.get('#sidebarChannelContainer').should('be.visible').should('contain', 'Town Square');
        cy.get('#channelHeaderTitle').should('be.visible').should('contain', 'Town Square');
    });

    it('MM-T683 /join', () => {
        // # Login as another user and create a new channel
        cy.apiAdminLogin();
        cy.apiCreateChannel(testTeam.id, 'new-channel', 'New Channel').then(({channel}) => {
            // # Login as test user and visit test channel
            loginAndVisitChannel(user1, testChannelUrl);

            // # Type "/join ~new-channel"
            cy.postMessage(`/join ~${channel.name}`);

            // * Verify user is redirected to New Channel
            cy.get('#channelHeaderTitle').should('be.visible').should('contain', channel.display_name);
        });
    });

    it('MM-T684 /me', () => {
        loginAndVisitChannel(user1, testChannelUrl);

        // # Type "/me test"
        cy.postMessage('/me test');

        // * Verify a message "test" is posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).find('.user-popover').should('have.text', user1.username);
            cy.get(`#postMessageText_${postId}`).should('have.text', 'test');

            // * The message should match other system message formatting.
            cy.get(`#post_${postId}`).should('have.class', 'post--system');
        });
    });

    it('MM-T685 /me not case-sensitive', () => {
        loginAndVisitChannel(user1, testChannelUrl);

        // # Type "/Me test"
        cy.postMessage('/Me test');

        // * Verify a message "test" is posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).find('.user-popover').should('have.text', user1.username);
            cy.get(`#postMessageText_${postId}`).should('have.text', 'test');
        });
    });

    it('MM-T686 /logout', () => {
        loginAndVisitChannel(user1, testChannelUrl);

        // # Type "/logout"
        cy.get('#post_textbox', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').clear().type('/logout{enter}').wait(TIMEOUTS.HALF_SEC);

        // * Ensure that the user was redirected to the login page
        cy.url().should('include', '/login');
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
