// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

import * as TIMEOUTS from '../../fixtures/timeouts';
import {getAdminAccount} from '../../support/env';

describe('autocomplete', () => {
    let testTeam;
    let testChannel;
    let testUser;
    let otherUser;
    let otherUser2;
    let notInChannelUser;
    let sysadmin;
    let displayNameTestUser;
    let displayNameOtherUser;

    before(() => {
        sysadmin = getAdminAccount();

        // # Login as admin and visit town-square
        cy.apiInitSetup({channelPrefix: {name: 'ask-anything', displayName: 'Ask Anything'}}).then(({team, channel, user}) => {
            testTeam = team;
            testChannel = channel;
            testUser = user;
            displayNameTestUser = `${testUser.first_name} ${testUser.last_name} (${testUser.nickname})`;

            cy.apiCreateUser({prefix: 'other'}).then(({user: user1}) => {
                otherUser = user1;

                cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, otherUser.id);
                });
                displayNameOtherUser = `${otherUser.first_name} ${otherUser.last_name} (${otherUser.nickname})`;
            });

            cy.apiCreateUser({prefix: 'other'}).then(({user: user1}) => {
                otherUser2 = user1;

                cy.apiAddUserToTeam(testTeam.id, otherUser2.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, otherUser2.id);
                });
            });

            cy.apiCreateUser({prefix: 'notinchannel'}).then(({user: user1}) => {
                notInChannelUser = user1;
                cy.apiAddUserToTeam(testTeam.id, notInChannelUser.id);
            });
        });
    });

    it('MM-T2199 @ autocomplete - username', () => {
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Clear then type @  and user name
        cy.get('#post_textbox').should('be.visible').clear().type(`@${testUser.username}`);

        // * Verify that the item is displayed or not as expected.
        cy.get('#suggestionList').within(() => {
            cy.findByText(displayNameTestUser).should('be.visible');
            cy.findByText(displayNameOtherUser).should('not.be.visible');
        });

        // # Post user mention
        cy.get('#post_textbox').type('{enter}{enter}');
        cy.uiWaitUntilMessagePostedIncludes(`${testUser.username}`);

        // # Check that the user name has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', `${testUser.username}`);
        });
    });

    it('MM-T2200 @ autocomplete - nickname', () => {
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Clear then type @ and user nickname
        cy.get('#post_textbox').should('be.visible').clear().type(`@${testUser.nickname}`);

        // * Verify that the item is displayed or not as expected.
        cy.get('#suggestionList').within(() => {
            cy.findByText(displayNameTestUser).should('be.visible');
            cy.findByText(displayNameOtherUser).should('not.be.visible');
        });

        // # Post user mention
        cy.get('#post_textbox').type('{enter}{enter}');
        cy.uiWaitUntilMessagePostedIncludes(`${testUser.username}`);

        // # Check that the user name has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', `${testUser.username}`);
        });
    });

    it('MM-T2201 @ autocomplete - first name', () => {
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Clear then type @  and user first names
        cy.get('#post_textbox').should('be.visible').clear().type(`@${testUser.first_name}`);

        // * Verify that the item is displayed or not as expected.
        cy.get('#suggestionList').within(() => {
            cy.findByText(displayNameTestUser).should('be.visible');
            cy.findByText(displayNameOtherUser).should('not.be.visible');
        });

        // # Post user mention
        cy.get('#post_textbox').type('{enter}{enter}');
        cy.uiWaitUntilMessagePostedIncludes(`${testUser.username}`);

        // # Check that the user name has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', `${testUser.username}`);
        });
    });

    it('MM-T2203 @ autocomplete - not email', () => {
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Clear then type @ and user email
        cy.get('#post_textbox').should('be.visible').clear().type(`@${testUser.email}`);

        // * Verify that the item is displayed or not as expected.
        cy.get('#suggestionList').should('not.be.visible');
    });

    it('MM-T2206 @ autocomplete - not in channel (center), have permission to add (public channel)', () => {
        const message = `@${notInChannelUser.username} did not get notified by this mention because they are not in the channel. Would you like to add them to the channel? They will have access to all message history.`;

        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Clear then type @
        cy.get('#post_textbox').should('be.visible').clear().type('@');

        // * Verify that the suggestion list is visible
        cy.get('#suggestionList').should('be.visible');

        // # Type user name
        cy.get('#post_textbox').type(`${notInChannelUser.username}`);

        // # Post user mention
        cy.get('#post_textbox').type('{enter}{enter}');
        cy.uiWaitUntilMessagePostedIncludes('They will have access to all message history.');
        cy.getLastPostId().then((postId) => {
            // * Verify that the correct system message is displayed or not
            cy.get(`#postMessageText_${postId}`).should('include.text', message);

            // * Click on the link to add the user to the channel
            cy.get('a.PostBody_addChannelMemberLink').should('be.visible').click();
            cy.uiWaitUntilMessagePostedIncludes('added to the channel by you');

            // * Verify that the correct system message is displayed or not
            cy.getLastPostId().then((npostId) => {
                cy.get(`#postMessageText_${npostId}`).should('include.text', `@${notInChannelUser.username} added to the channel by you`);
            });
        });
    });

    it('MM-T2207 Added to channel from autocomplete not in channel', () => {
        let tempUser;

        // # Create a temporary user
        cy.apiCreateUser({prefix: 'temp'}).then(({user: user1}) => {
            tempUser = user1;
            cy.apiAddUserToTeam(testTeam.id, tempUser.id);

            cy.apiLogin(testUser).then(() => {
                cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

                // # Clear then type @
                cy.get('#post_textbox').should('be.visible').clear().type('@');

                // * Verify that the suggestion list is visible
                cy.get('#suggestionList').should('be.visible');

                // # Type user name
                cy.get('#post_textbox').type(`${tempUser.username}`);

                // # Post user name mention
                cy.get('#post_textbox').type('{enter}{enter}');
                cy.uiWaitUntilMessagePostedIncludes('They will have access to all message history.');

                // * Verify that the correct system message is displayed
                cy.getLastPostId().then((postId) => {
                    cy.get(`#postMessageText_${postId}`).should('include.text', `@${tempUser.username} did not get notified by this mention because they are not in the channel. Would you like to add them to the channel? They will have access to all message history.`);

                    // * Click on the link to add the user to the channel
                    cy.get('a.PostBody_addChannelMemberLink').should('be.visible').click();
                    cy.uiWaitUntilMessagePostedIncludes('added to the channel by you');
                });

                cy.get('#sidebarItem_off-topic', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').click();
                cy.apiLogout().then(() => {
                    cy.apiLogin(tempUser).then(() => {
                        cy.visit(`/${testTeam.name}`);

                        // # Verify the mention notification exists
                        cy.get(`#sidebarItem_${testChannel.name}`).
                            scrollIntoView().
                            find('#unreadMentions').
                            should('be.visible').
                            and('have.text', '1');

                        // * Navigate to the channel the user has been added to
                        cy.get(`#sidebarItem_${testChannel.name}`).click();
                        cy.uiWaitUntilMessagePostedIncludes('You were added to the channel');

                        // * Verify that the correct system message is displayed or not
                        cy.getLastPostId().then((postId) => {
                            cy.get(`#postMessageText_${postId}`).should('include.text', `You were added to the channel by @${testUser.username}`);
                        });

                        cy.apiLogout().then(() => {
                            // # Login as admin to restore the original state
                            cy.apiLogin(sysadmin);
                        });
                    });
                });
            });
        });
    });

    it('MM-T2209 @ autocomplete - not in DM, GM', () => {
        const userGroupIds = [testUser.id, otherUser.id, otherUser2.id];

        // # Create a group channel for 3 users
        cy.apiCreateGroupChannel(userGroupIds).then(({channel: gmChannel}) => {
            // # Visit the channel using the name using the channels route
            cy.visit(`/${testTeam.name}/channels/${gmChannel.name}`);

            // # Clear then type @
            cy.get('#post_textbox').should('be.visible').clear().type('@');

            // * Verify that the suggestion list is visible
            cy.get('#suggestionList').should('be.visible');

            // # Type user name
            cy.get('#post_textbox').type(`${notInChannelUser.username}`);

            // # Post user name mention
            cy.get('#post_textbox').type('{enter}{enter}');
            cy.uiWaitUntilMessagePostedIncludes(`${notInChannelUser.username}`);

            // # Check that the user name has been posted
            cy.getLastPostId().then((postId) => {
                // * Verify that the correct system message is displayed or not
                cy.get(`#postMessageText_${postId}`).should('not.include.text', `@${notInChannelUser.username} did not get notified by this mention because they are not in the channel. Would you like to add them to the channel? They will have access to all message history.`);

                // # Check that the user name has been posted
                cy.get(`#postMessageText_${postId}`).should('contain', `${notInChannelUser.username}`);

                // * Verify that the @ mention is a link
                cy.get(`#postMessageText_${postId}`).find('.mention-link').should('exist');
            });
        });

        cy.apiCreateDirectChannel([testUser.id, otherUser.id]).then(() => {
            // # Visit the channel using the channel name
            cy.visit(`/${testTeam.name}/channels/${testUser.id}__${otherUser.id}`);

            // # Clear then type @
            cy.get('#post_textbox').should('be.visible').clear().type('@');

            // * Verify that the suggestion list is visible
            cy.get('#suggestionList').should('be.visible');

            // # Type user name
            cy.get('#post_textbox').type(`${notInChannelUser.username}`);
            cy.get('#post_textbox').type('{enter}{enter}');
            cy.uiWaitUntilMessagePostedIncludes(`${notInChannelUser.username}`);

            cy.getLastPostId().then((postId) => {
                // * Verify that the correct system message is displayed or not
                cy.get(`#postMessageText_${postId}`).should('not.include.text', `@${notInChannelUser.username} did not get notified by this mention because they are not in the channel. Would you like to add them to the channel? They will have access to all message history.`);

                // # Check that the user name has been posted
                cy.get(`#postMessageText_${postId}`).should('contain', `${notInChannelUser.username}`);

                // * Verify that the @ mention is a link
                cy.get(`#postMessageText_${postId}`).find('.mention-link').should('exist');
            });
        });
    });

    it('MM-T2212 @ mention followed by dot or underscore should highlight', () => {
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Type input suffixed with '.'
        cy.get('#post_textbox').clear().type(`@${sysadmin.username}.`).type('{enter}{enter}');
        cy.uiWaitUntilMessagePostedIncludes(`${sysadmin.username}`);

        cy.getLastPostId().then((postId) => {
            // # Check that the user name has been posted
            cy.get(`#postMessageText_${postId}`).should('contain', `${sysadmin.username}`);

            // * Verify that the group mention does have colored text
            cy.get(`#postMessageText_${postId}`).find('.mention-link.mention--highlight').should('exist');
        });

        // # Type input suffixed with '_'
        cy.get('#post_textbox').clear().type(`@${sysadmin.username}_`).type('{enter}{enter}');
        cy.uiWaitUntilMessagePostedIncludes(`${sysadmin.username}`);

        cy.getLastPostId().then((postId) => {
            // # Check that the user name has been posted
            cy.get(`#postMessageText_${postId}`).should('contain', `${sysadmin.username}`);

            // * Verify that the @ mention does have colored text
            cy.get(`#postMessageText_${postId}`).find('.mention-link.mention--highlight').should('exist');
        });
    });

    it('MM-T2214 @ mention from link in profile popover: center', () => {
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Post a message as a different user
        const message = `hello from ${otherUser.username}`;
        cy.postMessageAs({sender: otherUser, message, channelId: testChannel.id}).then((post) => {
            // # Click on username
            cy.get(`#post_${post.id}`).find('.user-popover').click();

            // * Popover should have rendered to screen
            cy.get('#user-profile-popover').should('be.visible').within(($el) => {
                cy.wrap($el).find('.user-popover__username').should('be.visible').click();
            });
        });

        cy.get('#post_textbox').type('{enter}');
        cy.uiWaitUntilMessagePostedIncludes(`${otherUser.username}`);

        // # Check that the @ mention of username has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', `${otherUser.username}`);
            cy.get(`#postMessageText_${postId}`).find('.mention-link').should('exist');
        });
    });
});
