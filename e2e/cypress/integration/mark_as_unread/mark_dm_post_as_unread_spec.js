// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
//
// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************
//
// Group: @messaging
import {markAsUnreadFromMenu, verifyPostNextToNewMessageSeparator} from './helpers';

describe('Mark DM post as Unread ', () => {
    beforeEach(function() {
        cy.apiAdminLogin().
            apiCreateUser().
            its('user').as('userA').
            apiInitSetup().
            then(({user, team}) => cy.
                apiAddUserToTeam(team.id, this.userA.id).
                apiCreateDirectChannel([user.id, this.userA.id]).its('channel').as('dmChannel').
                wrap(user).as('mainUser').
                wrap(team).as('team').
                wrap(`/${team.name}/messages/@${this.userA.username}`).as('link'),
            );
    });

    it('MM-T248_1 Mark DM post as Unread', function() {
        const NUMBER_OF_USER_A_UNREAD_MESSAGES = 4;

        cy.

            // # Post initial message from main user
            postMessageAs({
                sender: this.mainUser,
                message: 'Initial message',
                channelId: this.dmChannel.id,
            }).

            // # Post several messages from User A
            postListOfMessages({
                numberOfMessages: 3,
                sender: this.userA,
                channelId: this.dmChannel.id,
            }).

            // # Post messages from User A meant to be marked as unread
            postMessageAs({
                sender: this.userA,
                message: 'Unread from here',
                channelId: this.dmChannel.id,
            }).
            as('unreadFromHere').
            postListOfMessages({
                numberOfMessages: NUMBER_OF_USER_A_UNREAD_MESSAGES - 1,
                sender: this.userA,
                channelId: this.dmChannel.id,
            }).

            // # Post more messages from main user
            postListOfMessages({
                numberOfMessages: 3,
                sender: this.mainUser,
                channelId: this.dmChannel.id,
            });

        // # Visit the DM channel and open the thread in RHS
        cy.
            apiLogin(this.mainUser).
            visit(this.link);

        // # Мark the message from user A as unread
        cy.then(() => markAsUnreadFromMenu(this.unreadFromHere.id));

        // * Verify that new message separator exists above the unread messages
        cy.then(() => verifyPostNextToNewMessageSeparator(this.unreadFromHere.data.message));

        // * Verify that DM-channel is marked as unread
        cy.then(() => verifyChannelIsMarkedUnreadInLHS(this.userA.username, {
            numberOfUnreadMessages: NUMBER_OF_USER_A_UNREAD_MESSAGES,
        }));

        // # Leave DM-channel
        cy.get('.SidebarChannel:contains(Off-Topic)').click();

        // * Verify that DM-channel is still marked as unread, with the same "mention bubble"
        cy.then(() => verifyChannelIsMarkedUnreadInLHS(this.userA.username, {
            numberOfUnreadMessages: NUMBER_OF_USER_A_UNREAD_MESSAGES,
        }));

        // # Return to DM-channel
        cy.get(`.SidebarChannel:contains(${this.userA.username})`).click();

        // * Verify that DM-channel is marked as read
        cy.then(() => verifyChannelIsMarkedReadInLHS(this.userA.username));

        // * Verify that new message separator exists above the unread messages
        cy.then(() => verifyPostNextToNewMessageSeparator(this.unreadFromHere.data.message));
    });

    it('MM-T248_2 Mark DM post as Unread in a reply thread', function() {
        const NUMBER_OF_USER_A_UNREAD_MESSAGES = 4;

        cy.

            // # Post initial message from main user
            postMessageAs({
                sender: this.mainUser,
                message: 'Initial message',
                channelId: this.dmChannel.id,
            }).
            as('root').

            // # Post several messages from User A
            then(() => cy.postListOfMessages({
                numberOfMessages: 3,
                sender: this.userA,
                channelId: this.dmChannel.id,
                rootId: this.root.id,
            })).

            // # Post messages from User A meant to be marked as unread
            then(() => cy.postMessageAs({
                sender: this.userA,
                message: 'Unread from here',
                channelId: this.dmChannel.id,
                rootId: this.root.id,
            })).
            as('unreadFromHere').
            then(() => cy.postListOfMessages({
                numberOfMessages: NUMBER_OF_USER_A_UNREAD_MESSAGES - 1,
                sender: this.userA,
                channelId: this.dmChannel.id,
                rootId: this.root.id,
            })).

            // # Post more messages from main user
            then(() => cy.postListOfMessages({
                numberOfMessages: 3,
                sender: this.mainUser,
                channelId: this.dmChannel.id,
                rootId: this.root.id,
            }));

        // # Visit the DM channel and open the thread in RHS
        cy.
            apiLogin(this.mainUser).
            visit(this.link).
            then(() => cy.clickPostCommentIcon(this.root.id));

        // # Мark the message from user A as unread
        cy.then(() => markAsUnreadFromMenu(this.unreadFromHere.id, 'RHS_COMMENT'));

        // * Verify that new message separator exists above the unread messages
        cy.then(() => verifyPostNextToNewMessageSeparator(this.unreadFromHere.data.message));

        // * Verify that DM-channel is marked as unread
        cy.then(() => verifyChannelIsMarkedUnreadInLHS(this.userA.username, {
            numberOfUnreadMessages: NUMBER_OF_USER_A_UNREAD_MESSAGES,
        }));

        // # Leave DM-channel
        cy.get('.SidebarChannel:contains(Off-Topic)').click();

        // * Verify that DM-channel is still marked as unread, with the same "mention bubble"
        cy.then(() => verifyChannelIsMarkedUnreadInLHS(this.userA.username, {
            numberOfUnreadMessages: NUMBER_OF_USER_A_UNREAD_MESSAGES,
        }));

        // # Return to DM-channel
        cy.get(`.SidebarChannel:contains(${this.userA.username})`).click();

        // * Verify that DM-channel is marked as read
        cy.then(() => verifyChannelIsMarkedReadInLHS(this.userA.username));

        // * Verify that new message separator exists above the unread messages
        cy.then(() => verifyPostNextToNewMessageSeparator(this.unreadFromHere.data.message));
    });
});

function verifyChannelIsMarkedUnreadInLHS(channelName, {numberOfUnreadMessages}) {
    cy.

        // * Verify that DM-channel is marked as unread
        get('.SidebarChannelGroup_content').
        contains(channelName).
        parent().
        should('have.class', 'unread').

        // * Verify that DM channel "mention bubble" contains number of unread messages except mainUser's ones
        find('.badge').
        should('contain.text', numberOfUnreadMessages);
}

function verifyChannelIsMarkedReadInLHS(channelName) {
    cy.

        // * Verify that DM-channel is marked as read
        get('.SidebarChannelGroup_content').
        contains(channelName).
        parent().
        should('not.have.class', 'unread').

        // * Verify that DM channel "mention bubble" contains number of unread messages except mainUser's ones
        find('.badge').
        should('not.exist');
}
