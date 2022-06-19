// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @toast

import * as TIMEOUTS from '../../fixtures/timeouts';

import {scrollToTop} from './helpers';

describe('unread_with_bottom_start_toast', () => {
    let otherUser;
    let testTeam;
    let testChannelId;
    let testChannelName;

    before(() => {
        // # Create other user
        cy.apiCreateUser().then(({user}) => {
            otherUser = user;
        });

        // # Build data to test and login as testUser
        cy.apiInitSetup().then(({team, channel, user, channelUrl}) => {
            testTeam = team;
            testChannelName = channel.name;
            testChannelId = channel.id;

            cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                cy.apiAddUserToChannel(testChannelId, otherUser.id).then(() => {
                    cy.apiLogin(user);
                    cy.visit(channelUrl);
                });
            });

            cy.apiSaveUnreadScrollPositionPreference(user.id, 'start_from_newest');
        });
    });

    beforeEach(() => {
        // # Click on test channel then off-topic channel in LHS
        cy.uiClickSidebarItem(testChannelName);
        cy.wait(TIMEOUTS.ONE_SEC);

        cy.uiClickSidebarItem('off-topic');
        cy.wait(TIMEOUTS.ONE_SEC);
    });

    it('MM-40825_1 Unread with bottom start toast is shown when visiting a channel with unreads and should disappear if scrolled to new messages indicator', () => {
        // # Visit test channel to update last visited time then visit off-topic
        cy.uiClickSidebarItem(testChannelName);
        cy.uiClickSidebarItem('off-topic');

        // # Add enough messages
        for (let index = 0; index < 30; index++) {
            cy.postMessageAs({sender: otherUser, message: `This is an old message [${index}]`, channelId: testChannelId});
        }

        cy.wait(TIMEOUTS.ONE_SEC);

        // # Switch to test channel
        cy.uiClickSidebarItem(testChannelName);

        // * Verify the newest message is visible
        cy.get('div.post__content').contains('This is an old message [29]').should('be.visible');

        // * Verify the toast is visible with correct message
        cy.get('div.toast').should('be.visible').contains('30 new messages');

        // # Scroll to the new messages indicator
        cy.get('.NotificationSeparator').should('exist').scrollIntoView({offset: {top: -150}});

        // * Verify toast jump is not visible
        cy.get('div.toast__jump').should('not.exist');

        // * Verify toast is not visible
        cy.get('div.toast').should('not.exist');
    });

    it('MM-40825_2 Unread with bottom start toast should take to the new messages indicator when clicked', () => {
        // # Add enough messages
        for (let index = 0; index < 30; index++) {
            cy.postMessageAs({sender: otherUser, message: `This is an old message [${index}]`, channelId: testChannelId});
        }

        cy.wait(TIMEOUTS.ONE_SEC);

        // # Visit test channel
        cy.uiClickSidebarItem(testChannelName);

        // * Verify the toast is visible with correct message
        cy.get('div.toast').should('be.visible');

        // # Click on toast pointer
        cy.get('div.toast__visible div.toast__pointer').should('be.visible').click();

        // * Verify toast jump is not visible
        cy.get('div.toast__jump').should('not.exist');

        // * Verify toast is not visible
        cy.get('div.toast').should('not.exist');

        // * Verify new messages indicator is visible
        cy.get('.NotificationSeparator').should('be.visible');
    });

    it('MM-40825_3 Unread with bottom start toast is shown when post is marked as unread', () => {
        // # Visit test channel
        cy.uiClickSidebarItem(testChannelName);

        // # Scroll to the top to find the oldest message
        scrollToTop();

        cy.getNthPostId(1).then((postId) => {
            // # Mark post as unread
            cy.uiClickPostDropdownMenu(postId, 'Mark as Unread');
        });

        // # Visit off-topic channel and swtich back to test channel
        cy.uiClickSidebarItem('off-topic');
        cy.uiClickSidebarItem(testChannelName);

        // * Verify toast is visible
        cy.get('div.toast').should('be.visible').contains('60 new messages');

        // # Click on toast pointer
        cy.get('div.toast__visible div.toast__pointer').should('be.visible').click();

        // * Verify unread marked post is visible
        cy.get('div.post__content').contains('This is an old message [0]').should('be.visible');

        // * Verify new messages indicator is visible
        cy.get('.NotificationSeparator').should('be.visible');
    });
});
