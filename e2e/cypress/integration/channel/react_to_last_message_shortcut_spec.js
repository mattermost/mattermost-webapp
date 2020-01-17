// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../fixtures/timeouts';
import * as MESSAGES from '../../fixtures/messages';
import users from '../../fixtures/users.json';
import {generateRandomNumber} from '../../utils';

let channelId = '';
let newChannel = {};

describe('React to last message shortcut', () => {
    before(() => {
        cy.apiLogin('user-1');
        cy.visit('/');

        // # Get the current channels Id for later use such as posting message with other user
        cy.getCurrentChannelId().then((id) => {
            channelId = id;
        });

        // # Create a new channel for later use such as when channel is empty test
        cy.getCurrentTeamId().then((teamId) => {
            // eslint-disable-next-line no-magic-numbers
            const newChannelName = `emptychannel-${generateRandomNumber(1, 100)}`;
            cy.apiCreateChannel(teamId, newChannelName, newChannelName).then((response) => {
                newChannel = Object.assign({}, response.body);
            });
        });
    });

    it('Should open the emoji picker in the channel view when the focus on the center text box', () => {
        // # Make sure there is at least a message without reaction
        cy.postMessage(MESSAGES.TINY);

        // # Emulate react to last message shortcut when focus is on the center text box
        cy.get('#post_textbox', {timeout: TIMEOUTS.LARGE}).focus().clear().cmdOrCtrlShortcut('{shift}\\');
        cy.wait(TIMEOUTS.TINY);

        // * Check that emoji picker is opened
        cy.get('#emojiPicker').should('exist').within(() => {
            // # Search for an emoji and add it to message
            cy.findByPlaceholderText('Search Emoji').type('smile{enter}');
        });

        // * Check if the emoji picker has the entered reaction to last message
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).within(() => {
                cy.findByLabelText('reactions').should('exist');
                cy.findByLabelText('remove reaction smile').should('exist');
            });
        });
    });

    it('Should not open the emoji picker in the channel view when the focus is not on the center text box', () => {
        // # Make sure there is at least a message without reaction
        cy.postMessage(MESSAGES.TINY);

        // # Click anywhere to take focus away from center text box
        cy.get('#lhsList').within(() => {
            cy.findByText('Town Square').click();
        });

        // # Emulate react to last message shortcut
        cy.get('body').cmdOrCtrlShortcut('{shift}\\');
        cy.wait(TIMEOUTS.TINY);

        // * Check that emoji picker is not open
        cy.get('#emojiPicker').should('not.exist');
    });

    it('Should always reopen emoji picker even if shortcut is hit repeated multiple times', () => {
        // # Make sure there is at least a message without reaction
        cy.postMessage(MESSAGES.TINY);

        // # Emulate react to last message shortcut when focus is on the center text box
        cy.get('#post_textbox', {timeout: TIMEOUTS.LARGE}).focus().clear().cmdOrCtrlShortcut('{shift}\\');
        cy.wait(TIMEOUTS.TINY);

        // * Verify emoji picker opens
        cy.get('#emojiPicker').should('exist');

        // * Check if emoji picker is now opened
        cy.get('#emojiPicker').should('exist');

        // # Emulate react to last message shortcut multiple times
        cy.get('#post_textbox', {timeout: TIMEOUTS.LARGE}).focus().clear().cmdOrCtrlShortcut('{shift}\\');
        cy.wait(TIMEOUTS.TINY);
        cy.get('#post_textbox', {timeout: TIMEOUTS.LARGE}).focus().clear().cmdOrCtrlShortcut('{shift}\\');
        cy.wait(TIMEOUTS.TINY);

        // * Check if emoji picker is still open even after executing multiple times same shortcut
        cy.get('#emojiPicker').should('exist');

        // # Close the picker
        cy.get('body').click();

        // * Picker should be closed now
        cy.get('#emojiPicker').should('not.exist');

        // * Open with last emoji picker once again,
        cy.get('#post_textbox', {timeout: TIMEOUTS.LARGE}).focus().clear().cmdOrCtrlShortcut('{shift}\\');
        cy.wait(TIMEOUTS.TINY);

        // * Check if it can open again
        cy.get('#emojiPicker').should('exist').within(() => {
            // # Search for an emoji and add it to message
            cy.findByPlaceholderText('Search Emoji').type('smile{enter}');
        });

        // * Check if the emoji picker has the entered reaction to last message
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).within(() => {
                cy.findByLabelText('reactions').should('exist');
                cy.findByLabelText('remove reaction smile').should('exist');
            });
        });
    });

    it('Should add reaction to same post on which emoji picker was opened by shortcut,not on any new messages', () => {
        // # Make sure there is at least a message without reaction
        cy.postMessage(MESSAGES.TINY);

        // # Save the post id which user initially intended to add reactions to, for later use
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).as('postIdForAddingReaction');
        });

        // # Emulate react to last message shortcut
        cy.get('#post_textbox', {timeout: TIMEOUTS.LARGE}).focus().clear().cmdOrCtrlShortcut('{shift}\\');
        cy.wait(TIMEOUTS.TINY);

        // * Check that emoji picker is opened
        cy.get('#emojiPicker').should('exist');

        // # In meanwhile new messages pops up
        cy.postMessageAs({sender: users['user-2'], message: MESSAGES.TINY, channelId});

        // * Check if emoji picker is still open and add a reaction
        cy.get('#emojiPicker').should('exist').within(() => {
            // # Search for an emoji and add it to message
            cy.findByPlaceholderText('Search Emoji').type('smile{enter}');
        });

        // * Check if the emoji picker has the entered reaction to the message we initially intended
        cy.get('@postIdForAddingReaction').within(() => {
            cy.findByLabelText('reactions').should('exist');
            cy.findByLabelText('remove reaction smile').should('exist');
        });

        // * Also Check if latest new message shouldn't have the reaction since we didn't intent to add there
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).within(() => {
                cy.findByLabelText('reactions').should('not.exist');
                cy.findByLabelText('remove reaction smile').should('not.exist');
            });
        });
    });

    it('Should open emoji picker for last message when focus is on RHS comment with only one post', () => {
        // # Make sure there is at least a message to add comment to at center
        cy.postMessage(MESSAGES.TINY);

        // # Mouseover the last post and click post comment icon.
        cy.clickPostCommentIcon();

        // * Check that the RHS is open
        cy.get('#rhsContainer').should('be.visible');

        // # Emulate react to last message shortcut when focus is on the right text box
        cy.get('#reply_textbox', {timeout: TIMEOUTS.LARGE}).focus().clear().cmdOrCtrlShortcut('{shift}\\');
        cy.wait(TIMEOUTS.TINY);

        // * Check emoji picker opened
        cy.get('#emojiPicker').should('exist').within(() => {
            // # Search for an emoji and add it to message
            cy.findByPlaceholderText('Search Emoji').type('smile{enter}');
        });

        cy.getLastPostId().then((lastPostId) => {
            // # Since only one post was on the RHS, its the same message we entered on center
            cy.get(`#${lastPostId}_message`).within(() => {
                // * Check if reaction was entered on the last message
                cy.findByLabelText('reactions').should('exist');
                cy.findByLabelText('remove reaction smile').should('exist');
            });
        });

        cy.closeRHS();
    });

    it('Should open emoji picker for last comment when focus is on RHS comment with multiple comments', () => {
        // # Make sure there is at least a message to add comment to at center
        cy.postMessage(MESSAGES.TINY);

        // # Mouseover the last post and click post comment icon.
        cy.clickPostCommentIcon();

        // * Check that the RHS is open
        cy.get('#rhsContainer').should('be.visible');

        // # Post a replies in RHS.
        cy.postMessageReplyInRHS(MESSAGES.SMALL);
        cy.postMessageReplyInRHS(MESSAGES.TINY);

        // # Emulate react to last message shortcut when focus is on the right text box
        cy.get('#reply_textbox', {timeout: TIMEOUTS.LARGE}).focus().clear().cmdOrCtrlShortcut('{shift}\\');
        cy.wait(TIMEOUTS.TINY);

        // * Check emoji picker opened
        cy.get('#emojiPicker').should('exist').within(() => {
        // # Search for an emoji and add it to message
            cy.findByPlaceholderText('Search Emoji').type('smile{enter}');
        });

        cy.getLastPostId().then((lastPostId) => {
            // # Since this was the last post was on the RHS, its the same message center too
            cy.get(`#${lastPostId}_message`).within(() => {
                // * Check if reaction was entered on the last message
                cy.findByLabelText('reactions').should('exist');
                cy.findByLabelText('remove reaction smile').should('exist');
            });
        });

        cy.closeRHS();
    });

    it('Should open emoji picker for last post on center when RHS is open but focus is not on RHS text box', () => {
        // # Making sure there is at least a message to add comment to at center
        cy.postMessage(MESSAGES.TINY);

        // # Mouseover the entered post and click post comment icon.
        cy.clickPostCommentIcon();

        // * Check that the RHS is open
        cy.get('#rhsContainer').should('be.visible');

        // # Post a replies in RHS.
        cy.postMessageReplyInRHS(MESSAGES.SMALL);
        cy.postMessageReplyInRHS(MESSAGES.TINY);

        // # Save the post id in RHS, where reaction should not be added
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).as('postInRHS');
        });

        // # Incoming posts from other user
        cy.postMessageAs({sender: users['user-2'], message: MESSAGES.MEDIUM, channelId});

        cy.wait(TIMEOUTS.SMALL);

        // # Click anywhere to take focus away from RHS text box
        cy.get('#lhsList').within(() => {
            cy.findByText('Town Square').click();
        });

        // # Focus back on Center textbox and enter shortcut
        cy.get('#post_textbox', {timeout: TIMEOUTS.LARGE}).focus().clear().cmdOrCtrlShortcut('{shift}\\');
        cy.wait(TIMEOUTS.TINY);

        // * Check that emoji picker is opened when focus is on CENTER textbox
        cy.get('#emojiPicker').should('exist').within(() => {
            // # Search for an emoji and add it to message
            cy.findByPlaceholderText('Search Emoji').type('smile{enter}');
        });

        // # This post is in Center, where reaction is to be added
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).as('postInCenter');
        });

        // * Check if the emoji picker has the entered reaction to the message in the center
        cy.get('@postInCenter').within(() => {
            cy.findByLabelText('reactions').should('exist');
            cy.findByLabelText('remove reaction smile').should('exist');
        });

        // * Check if the emoji picker has not entered reaction to the message in the RHS
        cy.get('@postInRHS').within(() => {
            cy.findByLabelText('reactions').should('not.exist');
            cy.findByLabelText('remove reaction smile').should('not.exist');
        });

        cy.closeRHS();
    });

    it('Should not open emoji picker when channel is new and empty or archived', () => {
        // # Visit the new empty channel
        cy.visit(`/ad-1/channels/${newChannel.name}`);

        // * Check that there are no posts except you joined message
        cy.findAllByTestId('postView').should('have.length', 1);

        // # Emulate react to last message shortcut
        cy.get('body').cmdOrCtrlShortcut('{shift}\\');
        cy.wait(TIMEOUTS.TINY);

        // * Check that emoji picker is not opened for empty channel
        cy.get('#emojiPicker').should('not.exist');

        // # Post a message to channel
        cy.postMessage(MESSAGES.TINY);

        // # Archive the channel after posting a message
        cy.apiDeleteChannel(newChannel.id);

        // # Emulate react to last message shortcut
        cy.get('body').cmdOrCtrlShortcut('{shift}\\');
        cy.wait(TIMEOUTS.TINY);

        // * Check that emoji picker is not opened
        cy.get('#emojiPicker').should('not.exist');

        // # Close the archived channel
        cy.findByText('Close Channel').should('exist').click();
    });

    it('Should not open emoji picker for last message when the last message is not in the user view anymore', () => {
        cy.postMessage(MESSAGES.TINY);

        // Get the post id of the first post
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).as('firstPost');
        });

        // # Make a series of posts, so we post have sufficiently scrolled vertically
        cy.postMessageFromFile('long_text_post.txt');
        cy.postMessageFromFile('long_text_post.txt');
        cy.postMessageFromFile('long_text_post.txt');

        cy.postMessage(MESSAGES.SMALL);

        // Get the post id of the last post
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).as('lastPost');
        });

        // scroll to top post
        cy.get('@firstPost').scrollIntoView();

        // # Emulate react to last message shortcut when focus is on the center text box
        cy.get('#post_textbox', {timeout: TIMEOUTS.LARGE}).focus().clear().cmdOrCtrlShortcut('{shift}\\');
        cy.wait(TIMEOUTS.TINY);

        // * Check that emoji picker is not open
        cy.get('#emojiPicker').should('not.exist');

        // * No reactions should be present on first message
        cy.get('@firstPost').within(() => {
            cy.findByLabelText('reactions').should('not.exist');
        });

        // * No reactions should be present on first message
        cy.get('@lastPost').within(() => {
            cy.findByLabelText('reactions').should('not.exist');
        });
    });
});
