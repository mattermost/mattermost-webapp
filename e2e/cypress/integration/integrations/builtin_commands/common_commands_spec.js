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
import * as MESSAGES from '../../../fixtures/messages';

describe('I18456 Built-in slash commands: common', () => {
    let user1;
    let user2;
    const userGroup = [];
    let testChannelUrl;

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            user1 = user;
            testChannelUrl = `/${team.name}/channels/town-square`;

            cy.apiCreateUser().then(({user: otherUser}) => {
                user2 = otherUser;

                cy.apiAddUserToTeam(team.id, user2.id);
            });

            Cypress._.times(8, () => {
                cy.apiCreateUser().then(({user: otherUser}) => {
                    cy.apiAddUserToTeam(team.id, otherUser.id);
                    userGroup.push(otherUser);
                });
            });
        });
    });

    it('/ autocomplete list can scroll', () => {
        loginAndVisitDefaultChannel(user1, testChannelUrl);

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

    it('/shrug test', () => {
        // # Login as user2 and post a message
        loginAndVisitDefaultChannel(user2, testChannelUrl);
        cy.postMessage('hello from user2');

        // # Login as user1 and post "/shrug test"
        loginAndVisitDefaultChannel(user1, testChannelUrl);
        cy.postMessage('/shrug test');

        // * Verify that it posted message as expected from user1
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).find('.user-popover').should('have.text', user1.username);
            cy.get(`#postMessageText_${postId}`).should('have.text', 'test ¯\\_(ツ)_/¯');
        });

        // * Login as user2 and verify that it read the same message as expected from user1
        loginAndVisitDefaultChannel(user2, testChannelUrl);
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).find('.user-popover').should('have.text', user1.username);
            cy.get(`#postMessageText_${postId}`).should('have.text', 'test ¯\\_(ツ)_/¯');
        });
    });

    it('MM-T664 /groupmsg initial tests', () => {
        let mesg;
        loginAndVisitDefaultChannel(user1, testChannelUrl);

        const usernames1 = Cypress._.map(userGroup, 'username').slice(0, 4);
        const usernames1Format = [

            // # Format for sending a group message:
            // /groupmsg @[username1],@[username2],@[username3] [message]
            `@${usernames1[0]}, @${usernames1[1]}, @${usernames1[2]}, @${usernames1[3]}`,

            // # Use /groupmsg command and use a mix of @ symbols in front of some names but not all
            // # Format notes:
            // # Usernames do not have to contain the '@' character
            // # Accepts spaces after or before the commas when listing usernames
            `${usernames1[0]}, @${usernames1[1]} , ${usernames1[2]} , @${usernames1[3]}`,
        ];

        usernames1Format.forEach((users) => {
            // # Use /groupmsg command to send group message - "/groupmsg [usernames] [message]"
            mesg = MESSAGES.SMALL;
            const command = `/groupmsg ${users} ${mesg}`;
            cy.postMessage(command);

            // * Sends a Group Message to the specified users
            cy.uiWaitUntilMessagePostedIncludes(mesg);
            cy.getLastPostId().then((postId) => {
                cy.get(`#postMessageText_${postId}`).should('have.text', mesg);
            });
            usernames1.forEach((username) => {
                cy.contains('.channel-header__top', username).should('be.visible');
            });

            cy.contains('.sidebar-item', 'Town Square').click();
        });

        usernames1Format.forEach((users) => {
            // # Use /groupmsg command to send message to existing GM - "group msg [usernames]" (note: no message)
            // # Format notes: The command does not have to contain a message
            const command = `/groupmsg ${users}`;
            cy.postMessage(command);

            // * Message sent to existing GM as expected
            cy.uiWaitUntilMessagePostedIncludes(mesg);
            cy.getLastPostId().then((postId) => {
                cy.get(`#postMessageText_${postId}`).should('have.text', mesg);
            });
            usernames1.forEach((username) => {
                cy.contains('.channel-header__top', username).should('be.visible');
            });

            cy.contains('.sidebar-item', 'Town Square').click();
        });

        const usernames2 = Cypress._.map(userGroup, 'username').slice(1, 5);
        const usernames2Format = [
            `@${usernames2[0]}, @${usernames2[1]}, @${usernames2[2]}, @${usernames2[3]}`,
            `${usernames2[0]}, @${usernames2[1]} , ${usernames2[2]} , @${usernames2[3]}`,
        ];

        usernames2Format.forEach((users) => {
            // # Use /groupmsg command to create GM - "group msg [usernames]" (note: no message)
            // # Format notes: The command does not have to contain a message
            const command = `/groupmsg ${users}{enter}`;
            cy.postMessage(command);

            // * Group message created as expected
            usernames2.forEach((username) => {
                cy.contains('.channel-header__top', username).should('be.visible');
            });

            cy.contains('.sidebar-item', 'Town Square').click();
        });
    });

    it('MM-T666 /groupmsg error if messaging more than 7 users', () => {
        loginAndVisitDefaultChannel(user1, testChannelUrl);

        // # Include more than 7 valid users in the command
        const usernames = Cypress._.map(userGroup, 'username');
        const mesg1 = '/groupmsg @' + usernames.join(', @') + ' ' + MESSAGES.MEDIUM;
        cy.postMessage(mesg1);

        // * If adding more than 7 users (excluding current user), system message saying "Group messages are limited to a maximum of 7 users."
        cy.uiWaitUntilMessagePostedIncludes('Group messages are limited to a maximum of 7 users');
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('have.text', 'Group messages are limited to a maximum of 7 users.');
        });

        // # Include one invalid user in the command
        const mesg2 = '/groupmsg @' + usernames.slice(0, 2).join(', @') + ', @hello ' + MESSAGES.MEDIUM;
        cy.postMessage(mesg2);

        // * If users cannot be found, returns error that user could not be found
        cy.uiWaitUntilMessagePostedIncludes('Unable to find the user: @hello');
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('have.text', 'Unable to find the user: @hello');
        });

        // # Include more than one invalid user in the command
        const mesg3 = '/groupmsg @' + usernames.slice(0, 2).join(', @') + ', @hello, @world ' + MESSAGES.MEDIUM;
        cy.postMessage(mesg3);

        // * If users cannot be found, returns error that user could not be found
        cy.uiWaitUntilMessagePostedIncludes('Unable to find the users: @hello, @world');
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('have.text', 'Unable to find the users: @hello, @world');
        });
    });

    it('MM-T2345 /me on RHS', () => {
        loginAndVisitDefaultChannel(user1, testChannelUrl);
        cy.postMessage(MESSAGES.MEDIUM);

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
        loginAndVisitDefaultChannel(user1, testChannelUrl);

        const invalidChannel = 'oppagangnamstyle';

        // # Type /mute with random characters
        cy.postMessage(`/mute ${invalidChannel}`);
        cy.uiWaitUntilMessagePostedIncludes('Please use the channel handle to identify channels');

        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).

                // * Could not find the channel lalodkjngjrngorejng. Please use the channel handle to identify channels.
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
});

function loginAndVisitDefaultChannel(user, channelUrl) {
    cy.apiLogin(user);
    cy.visit(channelUrl);
}
