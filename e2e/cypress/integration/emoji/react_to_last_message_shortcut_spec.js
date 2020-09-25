// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @emoji

import * as TIMEOUTS from '../../fixtures/timeouts';
import * as MESSAGES from '../../fixtures/messages';

describe('Keyboard shortcut for adding reactions to last message in channel or thread', () => {
    let testUser;
    let otherUser;
    let testTeam;
    let townsquareChannel;
    let emptyChannel;

    before(() => {
        // # Enable Experimental View Archived Channels
        cy.apiUpdateConfig({
            TeamSettings: {
                ExperimentalViewArchivedChannels: true,
            },
        });

        cy.apiInitSetup().then(({team, channel, user}) => {
            testUser = user;
            testTeam = team;
            emptyChannel = channel;

            cy.apiCreateUser({prefix: 'other'}).then(({user: user1}) => {
                otherUser = user1;

                cy.apiGetChannelByName(testTeam.name, 'town-square').then((out) => {
                    townsquareChannel = out.channel;
                });

                cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(emptyChannel.id, otherUser.id);
                });
            });
        });
    });

    beforeEach(() => {
        // # Login as test user and visit town-square
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.get('#channelHeaderTitle').should('be.visible').and('contain', 'Town Square');

        // # Make sure there is at least a message without reaction for each test
        cy.postMessage(MESSAGES.TINY);
    });

    it('Should open emoji picker for last message by shortcut in the channel view when focus is on the center text box', () => {
        // # Emulate react to last message shortcut when focus is on the center text box
        pressShortcutReactToLastMessage('CENTER');

        // Add reaction on the opened emoji picker
        addingReactionWithEmojiPicker();

        // * Check if the emoji picker has the entered reaction to last message
        cy.getLastPostId().then((lastPostId) => {
            checkingIfReactionsWereAddedToPost(lastPostId);
        });
    });

    it('Should open emoji picker for last message by shortcut in the channel view when the focus is not on the center text box', () => {
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

    it('Should open emoji picker for last message by shortcut when focus is on RHS comment with root post only', () => {
        // # Mouseover the last post and click post comment icon.
        cy.clickPostCommentIcon();

        // * Check that the RHS is open
        cy.get('#rhsContainer').should('be.visible');

        // # Emulate react to last message shortcut when focus is on the right text box
        pressShortcutReactToLastMessage('RHS');

        // * Check emoji picker opened and add reaction
        addingReactionWithEmojiPicker();

        cy.getLastPostId().then((lastPostId) => {
            // # Since only one post was on the RHS, its the same message we entered on center
            checkingIfReactionsWereAddedToPost(lastPostId);
        });

        cy.closeRHS();
    });

    it('Should open emoji picker for last comment by shortcut when focus is on RHS comment with multiple comments', () => {
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

    it('Should not emoji picker for last message by shortcut if already an emoji picker is open for other message', () => {
        // # Get Id of first post
        cy.getLastPostId().then((firstPostId) => {
            // # Post another message
            cy.postMessage(MESSAGES.MEDIUM);

            // # Click reaction button to "First" message
            cy.clickPostReactionIcon(firstPostId);

            // # Enter the shortcut while picker is open
            pressShortcutReactToLastMessage();

            // # Add reaction to First post
            addingReactionWithEmojiPicker();

            // * Verify no reactions were added to latter message
            cy.getLastPostId().then((lastPostId) => {
                cy.get(`#${lastPostId}_message`).within(() => {
                    cy.findByLabelText('reactions').should('not.exist');
                    cy.findByLabelText('remove reaction smile').should(
                        'not.exist',
                    );
                });
            });
        });
    });

    it('Should always reopen emoji picker even if shortcut is hit repeatedly multiple times on center textbox', () => {
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

    it('Should always reopen emoji picker even if shortcut is hit repeatedly multiple times without center textbox focus', () => {
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

    it('Should add reaction to same post on which emoji picker was opened', () => {
        // # Save the post id which user initially intended to add reactions to, for later use
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).as('postIdForAddingReaction');
        });

        // # Emulate react to last message shortcut
        pressShortcutReactToLastMessage();

        // * Check that emoji picker is opened
        cy.get('#emojiPicker').should('exist');

        // # In meanwhile new messages pops up
        cy.postMessageAs({
            sender: otherUser,
            message: MESSAGES.TINY,
            channelId: townsquareChannel.id,
        });
        cy.wait(TIMEOUTS.FIVE_SEC);

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

    it('Should open emoji picker for last post by shortcut on center when RHS is open but focus is on Center textbox', () => {
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
        cy.postMessageAs({
            sender: otherUser,
            message: MESSAGES.MEDIUM,
            channelId: townsquareChannel.id,
        });
        cy.wait(TIMEOUTS.FIVE_SEC);

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

    it('Should open emoji picker for last message by shortcut on center when RHS is open but focus is neither on RHS nor Center text box ', () => {
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
        cy.postMessageAs({
            sender: otherUser,
            message: MESSAGES.MEDIUM,
            channelId: townsquareChannel.id,
        });
        cy.wait(TIMEOUTS.FIVE_SEC);

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

    it('Should not open emoji picker by shortcut when the last message is not in the user view anymore', () => {
        // Get the post id of the first post
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).as('firstPost');
        });

        // # Make a series of posts, so we post have sufficiently scrolled vertically
        cy.get('#post_textbox').
            clear().
            invoke('val', MESSAGES.LARGE).
            wait(TIMEOUTS.HALF_SEC).
            type(' {backspace}{enter}');
        cy.get('#post_textbox').
            clear().
            invoke('val', MESSAGES.HUGE).
            wait(TIMEOUTS.HALF_SEC).
            type(' {backspace}{enter}');
        cy.get('#post_textbox').
            clear().
            invoke('val', MESSAGES.LARGE).
            wait(TIMEOUTS.HALF_SEC).
            type(' {backspace}{enter}');
        cy.get('#post_textbox').
            clear().
            invoke('val', MESSAGES.HUGE).
            wait(TIMEOUTS.HALF_SEC).
            type(' {backspace}{enter}');
        cy.get('#post_textbox').
            clear().
            invoke('val', MESSAGES.LARGE).
            wait(TIMEOUTS.HALF_SEC).
            type(' {backspace}{enter}');
        cy.get('#post_textbox').
            clear().
            invoke('val', MESSAGES.HUGE).
            wait(TIMEOUTS.HALF_SEC).
            type(' {backspace}{enter}');

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

    it('Should not emoji picker by shortcut if any modals are open', () => {
        // # Open account settings modal
        openMainMenuOptions('Account Settings');

        // * Emulate react to last message shortcut and verify its blocked
        verifyShortcutReactToLastMessageIsBlocked();

        // * Open view members modal and verify shortcut is blocked
        openMainMenuOptions('View Members');
        verifyShortcutReactToLastMessageIsBlocked();

        // * Open about mattermost modal and verify shortcut is blocked
        openMainMenuOptions('About Mattermost');
        verifyShortcutReactToLastMessageIsBlocked();

        // * Open channel header modal and verify shortcut is blocked
        openChannelMainOptions('Edit Channel Header');
        verifyShortcutReactToLastMessageIsBlocked();

        // * Open Edit channel header modal and verify shortcut is blocked
        openChannelMainOptions('View Members');
        verifyShortcutReactToLastMessageIsBlocked();

        // * Open channel rename modal and verify shortcut is blocked
        openChannelMainOptions('Rename Channel');
        verifyShortcutReactToLastMessageIsBlocked();
    });

    it('Should not open the emoji picker by shortcut if any dropdown or popups are open', () => {
        // * Open the channel menu dropdown, execute the shortcut and verify it is blocked
        cy.findByLabelText('channel menu').click();
        verifyShortcutReactToLastMessageIsBlocked();

        // * Open the channel menu dropdown, execute the shortcut and verify it is blocked
        cy.findByLabelText('main menu').click();
        verifyShortcutReactToLastMessageIsBlocked();
    });

    it('Should not open the emoji picker by shortcut if RHS is fully expanded for search results, recent mentions, saved and pinned posts', () => {
        // # Open the saved message
        cy.findByLabelText('Saved posts').click();

        // # Expand the saved message
        cy.findByLabelText('Expand Sidebar Icon').click();

        // Execute the shortcut
        pressShortcutReactToLastMessage();

        // Check if emoji picker opened
        cy.get('#emojiPicker').should('not.exist');

        // Close the expanded sidebar
        cy.findByLabelText('Collapse Sidebar Icon').click();

        // # Open the Pinned Posts
        cy.findByLabelText('Pinned posts').click();

        // # Expand the Pinned Posts
        cy.findByLabelText('Expand Sidebar Icon').click();

        // Execute the shortcut
        pressShortcutReactToLastMessage();

        // Check if emoji picker opened
        cy.get('#emojiPicker').should('not.exist');

        // Close the expanded sidebar
        cy.findByLabelText('Collapse Sidebar Icon').click();
    });

    it('Should open the emoji picker for last message by shortcut if RHS is fully expanded for thread and focus is on RHS text box', () => {
        // # Mouseover the last post and click post comment icon.
        cy.clickPostCommentIcon();

        // * Check that the RHS is open
        cy.get('#rhsContainer').should('be.visible');

        // # Expand the RHS fully
        cy.findByLabelText('Expand').click();

        // # Emulate react to last message shortcut when focus is on the right text box
        pressShortcutReactToLastMessage('RHS');

        // * Check emoji picker opened and add reaction
        addingReactionWithEmojiPicker();

        cy.getLastPostId().then((lastPostId) => {
            // # Since only one post was on the RHS, its the same message we entered on center
            checkingIfReactionsWereAddedToPost(lastPostId);
        });

        // # Collapse the RHS
        cy.findByLabelText('Expand').click();
        cy.closeRHS();
    });

    it('Should not open emoji picker by shortcut if last post is a system message', () => {
        // # Login as admin to test against recent system message
        cy.apiAdminLogin();

        // # Visit the new empty channel
        cy.visit(`/${testTeam.name}/channels/${emptyChannel.name}`);

        // * Check that there are no posts except you joined message
        cy.findAllByTestId('postView').should('have.length', 1);

        // # Emulate react to last message shortcut
        pressShortcutReactToLastMessage();

        // * Check that emoji picker is not opened for system joining message
        cy.get('#emojiPicker').should('not.exist');

        // # Delete the system message
        cy.getLastPostId().then((lastPostId) => {
            cy.clickPostDotMenu(lastPostId);

            // # Click delete button.
            cy.get(`#delete_post_${lastPostId}`).click();

            // * Check that confirmation dialog is open.
            cy.get('#deletePostModal').should('be.visible');

            // # Confirm deletion.
            cy.get('#deletePostModalButton').click();

            // # Emulate react to last message shortcut
            pressShortcutReactToLastMessage('CENTER');

            // * Check that emoji picker is not opened for new channel
            cy.get('#emojiPicker').should('not.exist');
        });

        // # Post a message to channel
        cy.postMessage(MESSAGES.TINY);

        // # Archive the channel after posting a message
        cy.apiDeleteChannel(emptyChannel.id);

        // # Emulate react to last message shortcut
        pressShortcutReactToLastMessage();

        // * Check that emoji picker is not opened
        cy.get('#emojiPicker').should('not.exist');

        // # Close the archived channel
        cy.findByText('Close Channel').
            should('exist').
            click();
    });
});

/**
 * Fires off shortcut "React to last message".
 * @param {String} from CENTER or RHS or If left blank then it defaults to on-Body.
 */
function pressShortcutReactToLastMessage(from) {
    if (from === 'CENTER') {
        cy.get('#post_textbox', {timeout: TIMEOUTS.HALF_MIN}).
            focus().
            clear().
            cmdOrCtrlShortcut('{shift}\\');
    } else if (from === 'RHS') {
        cy.get('#reply_textbox', {timeout: TIMEOUTS.HALF_MIN}).
            focus().
            clear().
            cmdOrCtrlShortcut('{shift}\\');
    } else {
        cy.get('body', {timeout: TIMEOUTS.HALF_MIN}).cmdOrCtrlShortcut(
            '{shift}\\',
        );
    }
    cy.wait(TIMEOUTS.HALF_SEC);
}

/**
 * Adds an emoji on the opened emoji picker.
 */
function addingReactionWithEmojiPicker() {
    // * Check that emoji picker is opened.
    cy.get('#emojiPicker').
        should('exist').
        within(() => {
            // # Search for an emoji and add it to message.
            cy.findByPlaceholderText('Search emojis').type('smile').wait(TIMEOUTS.HALF_SEC);
            cy.findByTestId('smile').should('be.visible').click();
        });
    cy.wait(TIMEOUTS.HALF_SEC);
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

/**
 * Check if after shortcut is executed no emoji picker opens
 * @param {String} from CENTER or RHS or If left blank then it defaults to on-Body.
 */
function verifyShortcutReactToLastMessageIsBlocked(from) {
    pressShortcutReactToLastMessage(from);

    // * Verify no emoji picker is opened
    cy.get('#emojiPicker').should('not.exist');
}

function openMainMenuOptions(menu) {
    cy.get('body').type('{esc}').wait(TIMEOUTS.HALF_SEC);
    cy.findByLabelText('main menu').click();
    cy.findByText(menu).scrollIntoView().click();
}

function openChannelMainOptions(menu) {
    cy.get('body').type('{esc}').wait(TIMEOUTS.HALF_SEC);
    cy.findByLabelText('channel menu').click();
    cy.findByText(menu).scrollIntoView().should('be.visible').click();
}
