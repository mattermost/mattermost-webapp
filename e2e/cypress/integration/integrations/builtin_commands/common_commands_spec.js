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
        cy.uiWaitUntilMessagePostedIncludes('Unable to find the users: @hello @world');
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('have.text', 'Unable to find the users: @hello @world');
        });
    });
});

function loginAndVisitDefaultChannel(user, channelUrl) {
    cy.apiLogin(user);
    cy.visit(channelUrl);
}
