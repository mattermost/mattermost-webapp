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

const newChannelName = `channel-react-to-last-message-${Date.now()}`;
let channelId = '';
let newChannel = {};

describe('React to last message shortcut', () => {
    before(() => {
        cy.apiLogin('sysadmin');
        cy.visit('/');

        // # Get the current channels Id for later use such as posting message with other user
        cy.getCurrentChannelId().then((id) => {
            channelId = id;
        });

        // # Create a new channel for later use such as when channel is empty test
        cy.getCurrentTeamId().then((teamId) => {
            // eslint-disable-next-line no-magic-numbers
            cy.apiCreateChannel(teamId, newChannelName, newChannelName).then((response) => {
                newChannel = Object.assign({}, response.body);
            });
        });
    });

    beforeEach(() => {
        // # Make sure there is at least a message without reaction for each test
        cy.postMessage(MESSAGES.TINY);
    });

    it('Should not open the emoji picker if any modals are open', () => {
        // # Open account settings modal
        openMainMenuOptions('Account Settings');

        // * Emulate react to last message shortcut and verify its blocked
        verifyShortcutReactToLastMessageIsBlocked();

        // * Open view members modal and verify shortcut is blocked
        openMainMenuOptions('Manage Members');
        verifyShortcutReactToLastMessageIsBlocked();

        // * Open invite people full modal and verify shortcut is blocked
        openMainMenuOptions('Invite People');
        verifyShortcutReactToLastMessageIsBlocked();
    });

    xit('Should open the emoji picker in the channel view when the focus on the center text box', () => {
        // # Emulate react to last message shortcut when focus is on the center text box
        pressShortcutReactToLastMessage('CENTER');

        // Add reaction on the opened emoji picker
        addingReactionWithEmojiPicker();

        // * Check if the emoji picker has the entered reaction to last message
        cy.getLastPostId().then((lastPostId) => {
            checkingIfReactionsWereAddedToPost(lastPostId);
        });
    });

    xit('Should open the emoji picker in the channel view when the focus is not on the center text box', () => {
        // # Click anywhere to take focus away from center text box
        cy.get('#lhsList').within(() => {
            cy.findByText('Town Square').click();
        });

        // # Emulate react to last message shortcut without focus on center
        pressShortcutReactToLastMessage();

        // Add reaction on the opened emoji picker
        addingReactionWithEmojiPicker();

        // * Check if the emoji picker has the entered reaction to last message
        cy.getLastPostId().then((lastPostId) => {
            checkingIfReactionsWereAddedToPost(lastPostId);
        });
    });

    xit('Should always reopen emoji picker even if shortcut is hit repeated multiple times on center textbox', () => {
        // # Emulate react to last message shortcut when focus is on the center text box
        pressShortcutReactToLastMessage('CENTER');

        // * Verify emoji picker opens
        cy.get('#emojiPicker').should('exist');

        // # Emulate react to last message shortcut multiple times from center and check if it opens and then close it
        // # try 1
        pressShortcutReactToLastMessage('CENTER');
        cy.get('#emojiPicker').should('exist');
        cy.get('body').click();

        // # try 2
        pressShortcutReactToLastMessage('CENTER');
        cy.get('#emojiPicker').should('exist');
        cy.get('body').click();

        // # try 3
        pressShortcutReactToLastMessage('CENTER');
        cy.get('#emojiPicker').should('exist');
        cy.get('body').click();

        // * Check if emoji picker is closed
        cy.get('#emojiPicker').should('not.exist');

        // # Open with last emoji picker once again,
        pressShortcutReactToLastMessage('CENTER');

        // * Check if it can open again and add reaction
        addingReactionWithEmojiPicker();

        // * Check if the emoji picker has the entered reaction to last message
        cy.getLastPostId().then((lastPostId) => {
            checkingIfReactionsWereAddedToPost(lastPostId);
        });
    });

    xit('Should always reopen emoji picker even if shortcut is hit repeated multiple times without center textbox focus', () => {
        // # Emulate react to last message shortcut when focus is on the center text box
        pressShortcutReactToLastMessage();

        // * Verify emoji picker opens
        cy.get('#emojiPicker').should('exist');

        // # Emulate react to last message shortcut multiple times and check if it opens and then close it
        // # try 1
        pressShortcutReactToLastMessage();
        cy.get('#emojiPicker').should('exist');
        cy.get('body').click();

        // # try 2
        pressShortcutReactToLastMessage();
        cy.get('#emojiPicker').should('exist');
        cy.get('body').click();

        // # try 3
        pressShortcutReactToLastMessage();
        cy.get('#emojiPicker').should('exist');
        cy.get('body').click();

        // * Check if emoji picker is closed
        cy.get('#emojiPicker').should('not.exist');

        // # Open with last emoji picker once again,
        pressShortcutReactToLastMessage();

        // * Check if it can open again and add reaction
        addingReactionWithEmojiPicker();

        // * Check if the emoji picker has the entered reaction to last message
        cy.getLastPostId().then((lastPostId) => {
            checkingIfReactionsWereAddedToPost(lastPostId);
        });
    });

    xit('Should add reaction to same post on which emoji picker was opened by shortcut,not on any new messages', () => {
        // # Save the post id which user initially intended to add reactions to, for later use
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).as('postIdForAddingReaction');
        });

        // # Emulate react to last message shortcut
        pressShortcutReactToLastMessage();

        // * Check that emoji picker is opened
        cy.get('#emojiPicker').should('exist');

        // # In meanwhile new messages pops up
        cy.postMessageAs({sender: users['user-2'], message: MESSAGES.TINY, channelId});
        cy.wait(TIMEOUTS.SMALL);

        // * Check if emoji picker is still open and add a reaction
        addingReactionWithEmojiPicker();

        // * Check if the emoji picker has the entered reaction to the message we initially intended
        cy.get('@postIdForAddingReaction').within(() => {
            checkingIfReactionsWereAddedToPost('', false);
        });

        // * Also Check if latest new message shouldn't have the reaction since we didn't intent to add there
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).within(() => {
                cy.findByLabelText('reactions').should('not.exist');
                cy.findByLabelText('remove reaction smile').should('not.exist');
            });
        });
    });

    xit('Should open emoji picker for last message when focus is on RHS comment with only one post', () => {
        // # Mouseover the last post and click post comment icon.
        cy.clickPostCommentIcon();

        // * Check that the RHS is open
        cy.get('#rhsContainer').should('be.visible');

        // # Emulate react to last message shortcut when focus is on the right text box
        pressShortcutReactToLastMessage('RHS');

        // * Check emoji picker opened and reaction
        addingReactionWithEmojiPicker();

        cy.getLastPostId().then((lastPostId) => {
            // # Since only one post was on the RHS, its the same message we entered on center
            checkingIfReactionsWereAddedToPost(lastPostId);
        });

        cy.closeRHS();
    });

    xit('Should open emoji picker for last comment when focus is on RHS comment with multiple comments', () => {
        // # Mouseover the last post and click post comment icon.
        cy.clickPostCommentIcon();

        // * Check that the RHS is open
        cy.get('#rhsContainer').should('be.visible');

        // # Post few comments in RHS.
        cy.postMessageReplyInRHS(MESSAGES.SMALL);
        cy.postMessageReplyInRHS(MESSAGES.TINY);

        // # Emulate react to last message shortcut when focus is on the right text box
        pressShortcutReactToLastMessage('RHS');

        // * Check emoji picker opened and add reaction
        addingReactionWithEmojiPicker();

        cy.getLastPostId().then((lastPostId) => {
            // # Since this was the last post was on the RHS, its the same message center too
            checkingIfReactionsWereAddedToPost(lastPostId);
        });

        cy.closeRHS();
    });

    xit('Should open emoji picker for last post on center when RHS is open but focus is not on RHS text box but on Center textbox', () => {
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
        pressShortcutReactToLastMessage('CENTER');

        // * Check that emoji picker is opened when focus is on CENTER textbox
        addingReactionWithEmojiPicker();

        // # This post is in Center, where reaction is to be added
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).as('postInCenter');
        });

        // * Check if the emoji picker has the entered reaction to the message in the center
        cy.get('@postInCenter').within(() => {
            checkingIfReactionsWereAddedToPost('', false);
        });

        // * Check if the emoji picker has not entered reaction to the message in the RHS
        cy.get('@postInRHS').within(() => {
            cy.findByLabelText('reactions').should('not.exist');
            cy.findByLabelText('remove reaction smile').should('not.exist');
        });

        cy.closeRHS();
    });

    xit('Should open emoji picker for last post on center when RHS is open but focus is neither on RHS nor Center text box ', () => {
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

        // # Enter shortcut without focus on Center textbox
        pressShortcutReactToLastMessage();

        // * Check that emoji picker is opened when focus is not on CENTER textbox
        addingReactionWithEmojiPicker();

        // # This post is in Center, where reaction is to be added
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).as('postInCenter');
        });

        // * Check if the emoji picker has the entered reaction to the message in the center
        cy.get('@postInCenter').within(() => {
            checkingIfReactionsWereAddedToPost('', false);
        });

        // * Check if the emoji picker has not entered reaction to the message in the RHS
        cy.get('@postInRHS').within(() => {
            cy.findByLabelText('reactions').should('not.exist');
            cy.findByLabelText('remove reaction smile').should('not.exist');
        });

        cy.closeRHS();
    });

    xit('Should not open emoji picker for last message when the last message is not in the user view anymore', () => {
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

        // # Emulate react to last message shortcut
        pressShortcutReactToLastMessage();

        // * Check that emoji picker is not open
        cy.get('#emojiPicker').should('not.exist');

        // * No reactions should be present on the last message
        cy.get('@lastPost').within(() => {
            cy.findByLabelText('reactions').should('not.exist');
        });
    });

    // xit('Should not open emoji picker when channel is new and empty or archived', () => {
    //     // # Visit the new empty channel
    //     cy.visit(`/ad-1/channels/${newChannel.name}`);

    //     // * Check that there are no posts except you joined message
    //     cy.findAllByTestId('postView').should('have.length', 1);

    //     // # Emulate react to last message shortcut
    //     cy.get('body').cmdOrCtrlShortcut('{shift}\\');
    //     cy.wait(TIMEOUTS.TINY);

    //     // * Check that emoji picker is not opened for empty channel
    //     cy.get('#emojiPicker').should('not.exist');

    //     // # Post a message to channel
    //     cy.postMessage(MESSAGES.TINY);

    //     // # Archive the channel after posting a message
    //     cy.apiDeleteChannel(newChannel.id);

    //     // # Emulate react to last message shortcut
    //     cy.get('body').cmdOrCtrlShortcut('{shift}\\');
    //     cy.wait(TIMEOUTS.TINY);

    //     // * Check that emoji picker is not opened
    //     cy.get('#emojiPicker').should('not.exist');

    //     // # Close the archived channel
    //     cy.findByText('Close Channel').should('exist').click();
    // });
});

/**
 * Fires of shortcut "React to last message".
 * @param {String} from CENTER or RHS or If left blank then it defaults to on-Body.
 */
function pressShortcutReactToLastMessage(from) {
    if (from === 'CENTER') {
        cy.get('#post_textbox', {timeout: TIMEOUTS.LARGE}).focus().clear().cmdOrCtrlShortcut('{shift}\\');
    } else if (from === 'RHS') {
        cy.get('#reply_textbox', {timeout: TIMEOUTS.LARGE}).focus().clear().cmdOrCtrlShortcut('{shift}\\');
    } else {
        cy.get('body', {timeout: TIMEOUTS.LARGE}).cmdOrCtrlShortcut('{shift}\\');
    }
    cy.wait(TIMEOUTS.TINY);
}

/**
 * Adds an emoji on the opened emoji picker.
 */
function addingReactionWithEmojiPicker() {
    // * Check that emoji picker is opened.
    cy.get('#emojiPicker').should('exist').within(() => {
        // # Search for an emoji and add it to message.
        cy.findByPlaceholderText('Search Emoji').type('smile{enter}');
    });
    cy.wait(TIMEOUTS.TINY);
}

/**
 * Checks if 'smile' reaction was added to a post
 * @param {String} postId Post id of the message.
 * @param {Boolean} isNodeId If its a complete DOM node eg `211212_message`
 */
function checkingIfReactionsWereAddedToPost(postId, withinSamePost = true) {
    if (withinSamePost) {
        cy.get(`#${postId}_message`).within(() => {
            cy.findByLabelText('reactions').should('exist');
            cy.findByLabelText('remove reaction smile').should('exist');
        });
    } else {
        cy.findByLabelText('reactions').should('exist');
        cy.findByLabelText('remove reaction smile').should('exist');
    }
}

function verifyShortcutReactToLastMessageIsBlocked(from) {
    pressShortcutReactToLastMessage(from);

    // * Verify no emoji picker is opened
    cy.get('#emojiPicker').should('not.exist');
}

function openMainMenuOptions(menu) {
    cy.get('body').type('{esc}');
    cy.findByLabelText('main menu').click();
    cy.findByText(menu).click();
}