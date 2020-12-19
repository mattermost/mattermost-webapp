// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

import * as TIMEOUTS from '../../fixtures/timeouts';
import * as MESSAGES from '../../fixtures/messages';

describe('Messaging', () => {
    let testTeam;
    let testUser;
    let otherUser;
    let townsquareLink;

    const firstMessage = 'Hello';
    const message1 = 'message1';
    const message2 = 'message2';
    const messageX = 'messageX';

    const messageWithCodeblock1 = '```{shift}{enter}codeblock1{shift}{enter}```{shift}{enter}';
    const messageWithCodeblockTextOnly1 = 'codeblock1';
    const messageWithCodeblockIncomplete2 = '```{shift}{enter}codeblock2';
    const messageWithCodeblockTextOnly2 = 'codeblock2';
    const messageWithCodeblockIncomplete3 = '```{shift}{enter}codeblock3';
    const messageWithCodeblockTextOnly3 = 'codeblock3';

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;
            testUser = user;
            townsquareLink = `/${team.name}/channels/town-square`;
        });

        cy.apiCreateUser().then(({user: user1}) => {
            otherUser = user1;
            cy.apiAddUserToTeam(testTeam.id, otherUser.id);
        }).then(() => {
            cy.apiLogin(testUser);
            cy.visit(townsquareLink);
        });
    });

    beforeEach(() => {
        cy.apiLogin(testUser);

        // # Post a new message to ensure there will be a post to click on
        cy.get('#post_textbox').type(firstMessage).type('{enter}').wait(TIMEOUTS.HALF_SEC);
    });

    it('MM-T210 Center channel input box doesn\'t overlap with RHS', () => {
        // # Change viewport to tablet
        cy.viewport('ipad-2');

        const maxReplyCount = 15;

        // * Check if center channel post text box is focused
        cy.get('#post_textbox').should('be.focused');

        // # Click "Reply"
        cy.getLastPostId().then((postId) => {
            cy.clickPostCommentIcon(postId);
        });

        // * Check if center channel post text box is not focused
        // Although visually post text box is not visible to user,
        // cypress still considers it visible so the assertion
        // should('not.be.visible') will fail
        cy.get('#post_textbox').should('not.be.focused');

        // # Post several replies
        cy.get('#reply_textbox').clear().should('be.visible').as('replyTextBox');
        for (let i = 1; i <= maxReplyCount; i++) {
            cy.get('@replyTextBox').type(`post ${i}`).type('{enter}');
        }

        // * Check if "Add Comment" button is visible
        cy.get('#addCommentButton').scrollIntoView().should('be.visible').and('have.value', 'Add Comment');

        // # Reset the viewport
        cy.viewport(1280, 900);
    });

    it('MM-T712 Editing a post with Ctrl+Enter on for all messages configured', () => {
        // # Enable 'Send Messages on CTRL+ENTER > On for all messages' in Account Settings > Advanced
        cy.findAllByLabelText('main menu').should('be.visible').click();
        cy.findByText('Account Settings').click();
        cy.get('#accountSettingsModal').should('be.visible').within(() => {
            cy.findByText('Advanced').click();
            if (cy.isMac()) {
                cy.findByText('Send Messages on ⌘+ENTER').should('be.visible').click();
            } else {
                cy.findByText('Send Messages on CTRL+ENTER').should('be.visible').click();
            }
            cy.get('#ctrlSendOn').check().should('be.checked');
            cy.findByText('Save').click();
            cy.findAllByLabelText('Close').first().click();
        });

        // # [1] Post message
        cy.get('#post_textbox').type(message1).type('{enter}').wait(TIMEOUTS.HALF_SEC);

        // * Check that the message has not been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('not.contain', message1);
        });

        // # [2] Press CTRL+ENTER
        cy.typeCmdOrCtrl().type('{enter}').wait(TIMEOUTS.HALF_SEC);

        // * Check that the message has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', message1);
        });

        // # [3] Edit previous post
        cy.getLastPostId().then(() => {
            cy.get('#post_textbox').type('{uparrow}');

            // * Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // * Update the post message and type ENTER
            cy.get('#edit_textbox').invoke('val', '').type(message2).type('{enter}').wait(TIMEOUTS.HALF_SEC);

            // * Edit post modal is still visible after typing ENTER
            cy.get('#editPostModal').should('be.visible');

            // [4] Press CTRL+ENTER
            cy.typeCmdOrCtrlForEdit().type('{enter}').wait(TIMEOUTS.HALF_SEC);
        });

        // # [5] Post message with quotes
        cy.get('#post_textbox', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').clear().type(`${messageWithCodeblock1}{enter}`).wait(TIMEOUTS.HALF_SEC);

        // * Check that the message has not been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('not.contain', messageWithCodeblockTextOnly1);
        });

        // # [6] Press CTRL+ENTER
        cy.typeCmdOrCtrl().type('{enter}').wait(TIMEOUTS.HALF_SEC);

        // * Check that the message has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', messageWithCodeblockTextOnly1);
        });

        // # [7] Edit previous post
        cy.getLastPostId().then(() => {
            cy.get('#post_textbox').type('{uparrow}');

            // * Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // * Update the post message and type ENTER
            cy.get('#edit_textbox').invoke('val', '').type(messageWithCodeblock1).type('{enter}').wait(TIMEOUTS.HALF_SEC);

            // * Edit post modal is still visible after typing ENTER
            cy.get('#editPostModal').should('be.visible');

            // [8] Press CTRL+ENTER
            cy.typeCmdOrCtrlForEdit().type('{enter}').wait(TIMEOUTS.HALF_SEC);
        });

        // # [9] Post message with quotes
        cy.get('#post_textbox', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').clear().type(`${messageWithCodeblockIncomplete2}{enter}`).wait(TIMEOUTS.HALF_SEC);

        // * Check that the message has not been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('not.contain', messageWithCodeblockTextOnly2);
        });

        // # [10] Press CTRL+ENTER
        cy.typeCmdOrCtrl().type('{enter}').wait(TIMEOUTS.HALF_SEC);

        // * Check that the message has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', messageWithCodeblockTextOnly2);
        });

        // # [11] Edit previous post
        cy.getLastPostId().then(() => {
            cy.get('#post_textbox').type('{uparrow}');

            // * Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // * Update the post message and type ENTER
            cy.get('#edit_textbox').invoke('val', '').type(messageWithCodeblockIncomplete2).type('{enter}').wait(TIMEOUTS.HALF_SEC);

            // * Edit post modal is still visible after typing ENTER
            cy.get('#editPostModal').should('be.visible');

            // [12] Press CTRL+ENTER
            cy.typeCmdOrCtrlForEdit().type('{enter}').wait(TIMEOUTS.HALF_SEC);
        });

        // # [13] Post message with quotes with caret in the middle
        cy.get('#post_textbox', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').clear().type(`${messageWithCodeblockIncomplete3}{leftArrow}{leftArrow}{leftArrow}{enter}`).wait(TIMEOUTS.HALF_SEC);

        // * Check that the message has not been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('not.contain', messageWithCodeblockTextOnly3);
        });

        // # [14] Press CTRL+ENTER
        // * Post message again (previous one is broken)
        cy.get('#post_textbox', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').clear().type(`${messageWithCodeblockIncomplete3}{leftArrow}{leftArrow}{leftArrow}`).wait(TIMEOUTS.HALF_SEC);

        cy.typeCmdOrCtrl().type('{enter}').wait(TIMEOUTS.HALF_SEC);

        // * Check that the message has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', messageWithCodeblockTextOnly3);
        });

        // # [15] Edit previous post
        cy.getLastPostId().then(() => {
            cy.get('#post_textbox').type('{uparrow}');

            // * Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // * Update the post message and type ENTER
            cy.get('#edit_textbox').invoke('val', '').type(`${messageWithCodeblockIncomplete3}{leftArrow}{leftArrow}{leftArrow}{enter}`).wait(TIMEOUTS.HALF_SEC);

            // * Edit post modal is still visible after typing ENTER
            cy.get('#editPostModal').should('be.visible');

            // [16] Press CTRL+ENTER
            // * Post message again (previous one is broken)
            cy.get('#edit_textbox').invoke('val', '').type(`${messageWithCodeblockIncomplete3}{leftArrow}{leftArrow}{leftArrow}`);
            cy.typeCmdOrCtrlForEdit().type('{enter}');
        });

        // * Check that the message has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', messageWithCodeblockTextOnly3);
        });
    });

    it('MM-T3448 Editing a post with Ctrl+Enter only for code blocks starting with ``` configured', () => {
        // # Enable 'Send Messages on CTRL+ENTER > On only for code blocks starting with ```' in Account Settings > Advanced
        cy.findAllByLabelText('main menu').should('be.visible').click();
        cy.findByText('Account Settings').click();
        cy.get('#accountSettingsModal').should('be.visible').within(() => {
            cy.findByText('Advanced').click();
            if (cy.isMac()) {
                cy.findByText('Send Messages on ⌘+ENTER').should('be.visible').click();
            } else {
                cy.findByText('Send Messages on CTRL+ENTER').should('be.visible').click();
            }
            cy.get('#ctrlSendOnForCode').check().should('be.checked');
            cy.findByText('Save').click();
            cy.findAllByLabelText('Close').first().click();
        });

        // # [17] Post message
        cy.get('#post_textbox').type(message1).type('{enter}').wait(TIMEOUTS.HALF_SEC);

        // * Check that the message has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', message1);
        });

        // # [18] Edit previous post
        cy.getLastPostId().then(() => {
            cy.get('#post_textbox').type('{uparrow}');

            // * Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // * Update the post message and type ENTER
            cy.get('#edit_textbox').invoke('val', '').type(message2).type('{enter}').wait(TIMEOUTS.HALF_SEC);
        });

        // * Check that the edited message has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', message2);
        });

        // # [19] Post message with quotes
        cy.get('#post_textbox', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').clear().type(`${messageWithCodeblock1}`).wait(TIMEOUTS.HALF_SEC);
        cy.get('#post_textbox').type('{enter}');

        // * Check that the message has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', messageWithCodeblockTextOnly1);
        });

        // # [20] Edit previous post
        cy.getLastPostId().then(() => {
            cy.get('#post_textbox').type('{uparrow}');

            // * Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // * Update the post message and type ENTER
            cy.get('#edit_textbox').invoke('val', '').type(messageWithCodeblock1).type('{enter}').wait(TIMEOUTS.HALF_SEC);
        });

        // * Check that the edited message has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', messageWithCodeblockTextOnly1);
        });

        // # [21] Post message with quotes incomplete
        cy.get('#post_textbox').should('be.visible').clear().type(`${messageWithCodeblockIncomplete2}`).wait(TIMEOUTS.HALF_SEC);
        cy.get('#post_textbox').type('{enter}');

        // * Check that the message has not been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('not.contain', messageWithCodeblockTextOnly2);
        });

        // # [22] Press CTRL+ENTER
        cy.typeCmdOrCtrl().type('{enter}');

        // * Check that the message has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', messageWithCodeblockTextOnly2);
        });

        // # [23] Edit previous post
        cy.getLastPostId().then(() => {
            cy.get('#post_textbox').type('{uparrow}');

            // * Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // * Update the post message and type ENTER
            cy.get('#edit_textbox').invoke('val', '').type(messageWithCodeblockIncomplete2).type('{enter}').wait(TIMEOUTS.HALF_SEC);

            // * Edit post modal is still visible after typing ENTER
            cy.get('#editPostModal').should('be.visible');

            // [24] Press CTRL+ENTER
            cy.typeCmdOrCtrlForEdit().type('{enter}').wait(TIMEOUTS.HALF_SEC);
        });

        // * Check that the edited message has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', messageWithCodeblockTextOnly2);
        });

        // # [25] Post message with quotes with caret in the middle
        cy.get('#post_textbox').should('be.visible').clear().type(`${messageWithCodeblockIncomplete3}{leftArrow}{leftArrow}{leftArrow}{enter}`).wait(TIMEOUTS.HALF_SEC);

        // * Check that the message has not been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('not.contain', messageWithCodeblockTextOnly3);
        });

        // # [26] Press CTRL+ENTER
        // * Post message again (previous one is broken)
        cy.get('#post_textbox').should('be.visible').clear().type(`${messageWithCodeblockIncomplete3}{leftArrow}{leftArrow}{leftArrow}`).wait(TIMEOUTS.HALF_SEC);

        cy.typeCmdOrCtrl().type('{enter}');

        // * Check that the message has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', messageWithCodeblockTextOnly3);
        });

        // # [27] Edit previous post
        cy.getLastPostId().then(() => {
            cy.get('#post_textbox').type('{uparrow}');

            // * Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // * Update the post message and type ENTER
            cy.get('#edit_textbox').invoke('val', '').type(`${messageWithCodeblockIncomplete3}{leftArrow}{leftArrow}{leftArrow}`).wait(TIMEOUTS.HALF_SEC);
            cy.get('#edit_textbox').type('{enter}');

            // * Edit post modal is still visible after typing ENTER
            cy.get('#editPostModal').should('be.visible');

            // [28] Press CTRL+ENTER
            // * Post message again (previous one is broken)
            cy.get('#edit_textbox').invoke('val', '').type(`${messageWithCodeblockIncomplete3}{leftArrow}{leftArrow}{leftArrow}`).wait(TIMEOUTS.HALF_SEC);
            cy.typeCmdOrCtrlForEdit().type('{enter}').wait(TIMEOUTS.HALF_SEC);
        });

        // * Check that the message has been posted
        // Bug? - when clocking CTRL+ENTER from edit box, the code block does not appear in center
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', messageWithCodeblockTextOnly3);
        });
    });

    it('MM-T3449 Editing a post with Ctrl+Enter off for code blocks configured', () => {
        // # Enable 'Send Messages on CTRL+ENTER > Off in Account Settings > Advanced
        cy.findAllByLabelText('main menu').should('be.visible').click();
        cy.findByText('Account Settings').click();
        cy.get('#accountSettingsModal').should('be.visible').within(() => {
            cy.findByText('Advanced').click();
            if (cy.isMac()) {
                cy.findByText('Send Messages on ⌘+ENTER').should('be.visible').click();
            } else {
                cy.findByText('Send Messages on CTRL+ENTER').should('be.visible').click();
            }
            cy.get('#ctrlSendOff').check().should('be.checked');
            cy.findByText('Save').click();
            cy.findAllByLabelText('Close').first().click();
        });

        // # [29] Post message
        cy.get('#post_textbox').type(message1).wait(TIMEOUTS.HALF_SEC);
        cy.get('#post_textbox').type('{enter}');

        // * Check that the message has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', message1);
        });

        // # [30] Edit previous post
        cy.getLastPostId().then(() => {
            cy.get('#post_textbox').type('{uparrow}');

            // * Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // * Update the post message and type ENTER
            cy.get('#edit_textbox').invoke('val', '').type(message2).type('{enter}').wait(TIMEOUTS.HALF_SEC);
        });

        // * Check that the edited message has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', message2);
        });

        // # [31] Post message with quotes
        cy.get('#post_textbox', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').clear().type(`${messageWithCodeblock1}`).wait(TIMEOUTS.HALF_SEC);
        cy.get('#post_textbox').type('{enter}').wait(TIMEOUTS.HALF_SEC);

        // * Check that the message has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', messageWithCodeblockTextOnly1);
        });

        // # [32] Edit previous post
        cy.getLastPostId().then(() => {
            cy.get('#post_textbox').type('{uparrow}');

            // * Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // * Update the post message and type ENTER
            cy.get('#edit_textbox').invoke('val', '').type(messageWithCodeblock1).type('{enter}').wait(TIMEOUTS.HALF_SEC);
        });

        // * Check that the edited message has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', messageWithCodeblockTextOnly1);
        });

        // # [33] Post message with quotes incomplete
        cy.get('#post_textbox').should('be.visible').clear().type(`${messageWithCodeblockIncomplete2}`).wait(TIMEOUTS.HALF_SEC);
        cy.get('#post_textbox').type('{enter}').wait(TIMEOUTS.HALF_SEC);

        // * Check that the message has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', messageWithCodeblockTextOnly2);
        });

        // # [34] Edit previous post
        cy.getLastPostId().then(() => {
            cy.get('#post_textbox').type('{uparrow}');

            // * Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // * Update the post message and type ENTER
            cy.get('#edit_textbox').invoke('val', '').type(messageWithCodeblockIncomplete2).wait(TIMEOUTS.HALF_SEC);
            cy.get('#edit_textbox').type('{enter}');
        });

        // * Check that the edited message has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', messageWithCodeblockTextOnly2);
        });

        // # [35] Post message with quotes with caret in the middle
        cy.get('#post_textbox').should('be.visible').clear().type(`${messageWithCodeblockIncomplete3}{leftArrow}{leftArrow}{leftArrow}`).wait(TIMEOUTS.HALF_SEC);
        cy.get('#post_textbox').type('{enter}');

        // * Check that the message has been posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', messageWithCodeblockTextOnly3);
        });

        // # [36] Edit previous post
        cy.getLastPostId().then(() => {
            cy.get('#post_textbox').type('{uparrow}');

            // * Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // * Update the post message and type ENTER
            cy.get('#edit_textbox').invoke('val', '').type(`${messageWithCodeblockIncomplete3}{leftArrow}{leftArrow}{leftArrow}`).wait(TIMEOUTS.HALF_SEC);
            cy.get('#edit_textbox').type('{enter}');
        });

        // * Check that the message has been posted
        // Bug? - when clocking CTRL+ENTER from edit box, the code block does not appear in center
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('contain', messageWithCodeblockTextOnly3);
        });
    });

    it('MM-T2139 Canceling out of editing a message makes no changes - Center', () => {
        // # Post message
        cy.get('#post_textbox').type(message1).type('{enter}').wait(TIMEOUTS.HALF_SEC);

        // # Edit post containing channel link
        cy.getLastPostId().then((postId) => {
            cy.clickPostDotMenu(postId);

            // * Click edit post
            cy.get(`#edit_post_${postId}`).scrollIntoView().should('be.visible').click();
            cy.get('#editPostModal').should('be.visible');

            // * Close the modal
            cy.get('#editButton', {timeout: TIMEOUTS.FIVE_SEC}).should('be.visible').click();
        });

        // # Verify that last post does not contain (edited)
        cy.getLastPostId().then(() => {
            cy.findByText('@sysadmin').should('not.contain', '(edited)');
        });
    });

    it('MM-T2140 Edited message displays edits and `(edited)` in center and RHS', () => {
        // # Mobile app
        cy.viewport('iphone-6');

        // # Post message
        cy.get('#post_textbox').type(message1).type('{enter}').wait(TIMEOUTS.HALF_SEC);

        // # Edit post by opening modal
        cy.getLastPostId().then((postId) => {
            cy.clickPostDotMenu(postId);

            // * Click edit post
            cy.get(`#edit_post_${postId}`).scrollIntoView().should('be.visible').click();
            cy.get('#editPostModal').should('be.visible');

            // * Update the message
            cy.get('#edit_textbox', {timeout: TIMEOUTS.FIVE_SEC}).type(message2).wait(TIMEOUTS.HALF_SEC);

            // * Close the modal
            cy.get('#editButton', {timeout: TIMEOUTS.FIVE_SEC}).should('be.visible').click();
        });

        cy.getLastPostId().then((postId) => {
            // # Verify that the posted message contains (edited)
            cy.get(`#post_${postId}`).within((el) => {
                cy.wrap(el).find('.post-edited__indicator').should('have.text', '(edited)');
            });

            // # Open the RHS panel
            cy.clickPostCommentIcon(postId);

            // # Verify that the updated post message in RHS contains (edited)
            cy.get('#rhsContainer').should('be.visible').within(() => {
                cy.get(`#rhsPost_${postId}`).within((el) => {
                    cy.wrap(el).find('.post-edited__indicator').should('have.text', '(edited)');
                });
            });
        });

        // # Web app
        cy.viewport(1280, 900);

        // # Post message
        cy.get('#post_textbox').type(message1).type('{enter}').wait(TIMEOUTS.HALF_SEC);

        // # Click "Reply"
        cy.getLastPostId().then((postId) => {
            // # Open the RHS panel
            cy.clickPostCommentIcon(postId);
        });

        // # Edit post by opening modal
        cy.getLastPostId().then((postId) => {
            cy.clickPostDotMenu(postId);

            // * Click edit post
            cy.get(`#edit_post_${postId}`).scrollIntoView().should('be.visible').click();
            cy.get('#editPostModal').should('be.visible');

            // * Update the message
            cy.get('#edit_textbox', {timeout: TIMEOUTS.FIVE_SEC}).type(message2).wait(TIMEOUTS.HALF_SEC);

            // * Close the modal
            cy.get('#editButton', {timeout: TIMEOUTS.FIVE_SEC}).should('be.visible').click();
        });

        cy.getLastPostId().then((postId) => {
            // # Verify that the posted message contains (edited)
            cy.get(`#post_${postId}`).within((el) => {
                cy.wrap(el).find('.post-edited__indicator').should('have.text', '(edited)');
            });

            // # Verify that the updated post message in RHS contains (edited)
            cy.get('#rhsContainer').should('be.visible').within(() => {
                cy.get(`#rhsPost_${postId}`).within((el) => {
                    cy.wrap(el).find('.post-edited__indicator').should('have.text', '(edited)');
                });
            });
        });
    });

    it('MM-T2141 Edit non-list to be numbered list', () => {
        const messageText = 'Post';
        const numberedListTextPart1Prefix = '1. ';
        const numberedListTextPart1 = 'One';
        const numberedListTextPart2Prefix = '2. ';
        const numberedListTextPart2 = new Array(32).fill('Two').join(' ');

        // # Post message
        cy.get('#post_textbox').type(messageText).type('{enter}').wait(TIMEOUTS.HALF_SEC);

        // # Edit post by opening modal
        cy.getLastPostId().then((postId) => {
            cy.clickPostDotMenu(postId);

            // * Click edit post
            cy.get(`#edit_post_${postId}`).scrollIntoView().should('be.visible').click();
            cy.get('#editPostModal').should('be.visible');

            // * Update the message
            cy.get('#edit_textbox', {timeout: TIMEOUTS.HALF_SEC}).invoke('val', '').type(numberedListTextPart1Prefix + numberedListTextPart1).type('{shift}{enter}').type(numberedListTextPart2Prefix + numberedListTextPart2).wait(TIMEOUTS.HALF_SEC);

            // * Close the modal
            cy.get('#editButton', {timeout: TIMEOUTS.FIVE_SEC}).should('be.visible').click();
        });

        // # Ensure the list and two bullets have been rendered
        cy.getLastPostId().then(() => {
            cy.get('ol.markdown__list').should('be.visible').within(() => {
                cy.contains(numberedListTextPart1);
                cy.contains(numberedListTextPart2);
            });
        });
    });

    it('MM-T2142 Edit code block', () => {
        const codeBlockMessage = '    test';
        const updateMessageText = ' update';

        // # Post message
        cy.get('#post_textbox').type(codeBlockMessage).type('{enter}').wait(TIMEOUTS.HALF_SEC);

        // # Edit post by opening modal
        cy.getLastPostId().then((postId) => {
            cy.clickPostDotMenu(postId);

            // * Click edit post
            cy.get(`#edit_post_${postId}`).scrollIntoView().should('be.visible').click();
            cy.get('#editPostModal').should('be.visible');

            // * Update the message
            cy.get('#edit_textbox', {timeout: TIMEOUTS.FIVE_SEC}).type(updateMessageText).wait(TIMEOUTS.HALF_SEC);

            // * Close the modal
            cy.get('#editButton', {timeout: TIMEOUTS.FIVE_SEC}).should('be.visible').click();
        });

        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).within((el) => {
                // # Verify that the message is in a code block
                cy.wrap(el).find('.post-code.post-code--wrap').should('have.text', 'test update');

                // # Verify that the updated post contains '(edited)'
                cy.wrap(el).find('.post-edited__indicator').should('have.text', '(edited)');
            });
        });
    });

    it('MM-T2144 Up arrow, edit', () => {
        // # Post message
        cy.get('#post_textbox').type(message1).type('{enter}').wait(TIMEOUTS.HALF_SEC);

        // # Edit the post by opening modal
        cy.getLastPostId().then(() => {
            cy.get('#post_textbox').type('{uparrow}');

            // * Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // * Update the post message
            cy.get('#edit_textbox', {timeout: TIMEOUTS.FIVE_SEC}).invoke('val', '').type(message2).wait(TIMEOUTS.HALF_SEC);

            // * Close the modal
            cy.get('#editButton', {timeout: TIMEOUTS.FIVE_SEC}).should('be.visible').click();
        });

        cy.getLastPostId().then((postId) => {
            // # Verify that the updated post contains '(edited)'
            cy.get(`#post_${postId}`).within((el) => {
                // # Verify that the updated post contains updated message
                cy.wrap(el).findByText(message2).should('be.visible');
                cy.wrap(el).find('.post-edited__indicator').should('have.text', '(edited)');
            });
        });
    });

    it('MM-T2145 Other user sees `(edited)`', () => {
        // # Post message
        cy.get('#post_textbox').type(message1).type('{enter}').wait(TIMEOUTS.HALF_SEC);

        // # Edit the post by opening modal
        cy.getLastPostId().then(() => {
            cy.get('#post_textbox').type('{uparrow}');

            // * Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // * Update the post message and type ENTER
            cy.get('#edit_textbox', {timeout: TIMEOUTS.FIVE_SEC}).type(message2).wait(TIMEOUTS.HALF_SEC);

            // * Close the edit post modal
            cy.get('#editButton', {timeout: TIMEOUTS.FIVE_SEC}).should('be.visible').click();
        });

        // # Login as another user
        cy.apiLogin(otherUser);

        cy.getLastPostId().then((postId) => {
            // # Verify that the updated post contains '(edited)'
            cy.get(`#post_${postId}`).within((el) => {
                cy.wrap(el).find('.post-edited__indicator').should('have.text', '(edited)');
            });

            // # Reply to the message
            // * Launch reply post modal
            cy.clickPostCommentIcon(postId);

            cy.get('#rhsContainer').should('be.visible').within(() => {
                // # Verify that the updated post in RHS contains '(edited)'
                cy.get(`#rhsPost_${postId}`).within((el) => {
                    cy.wrap(el).find('.post-edited__indicator').should('have.text', '(edited)');
                });
            });
        });
    });

    it('MM-T2149 Edit a message in search results RHS', () => {
        // # Post a message
        cy.postMessage(messageX);

        cy.getLastPostId().then((postId) => {
            // # Search for the posted message
            cy.get('#searchBox').should('be.visible').type(messageX).type('{enter}').wait(TIMEOUTS.HALF_SEC);

            // # Click on post dot menu so we can edit
            cy.clickPostDotMenu(postId, 'SEARCH');
            cy.get('.dropdown-menu').should('be.visible').within(() => {
                cy.findByText('Edit').click();
            });

            // * Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // * Update the post message and type ENTER
            cy.get('#edit_textbox', {timeout: TIMEOUTS.FIVE_SEC}).invoke('val', '').type(message2).type('{enter}').wait(TIMEOUTS.HALF_SEC);

            // * Post appears in RHS search results, displays Pinned badge
            cy.get(`#searchResult_${postId}`).findByText('(edited)').should('exist');

            // # Verify that the updated post contains '(edited)'
            cy.get(`#post_${postId}`).within((el) => {
                cy.wrap(el).find('.post-edited__indicator').should('have.text', '(edited)');
            });

            // # Close the modal
            cy.findAllByLabelText('Close').should('be.visible').first().click();
        });
    });

    it('MM-T2152 Edit long message - edit box expands to larger size', () => {
        // # Post message
        cy.get('#post_textbox').
            clear().
            invoke('val', MESSAGES.HUGE).
            wait(TIMEOUTS.HALF_SEC).
            type(' {backspace}{enter}');

        // # Edit post by opening modal
        cy.getLastPostId().then((postId) => {
            cy.clickPostDotMenu(postId);

            // # Click edit post
            cy.get(`#edit_post_${postId}`).scrollIntoView().should('be.visible').click();

            // * Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // # Check that a scrollbar exists
            cy.get('.textarea-wrapper.scroll').should('be.visible');

            // # Update the message
            cy.get('#edit_textbox', {timeout: TIMEOUTS.FIVE_SEC}).type(' test').wait(TIMEOUTS.HALF_SEC);

            // # Close the modal
            cy.get('#editButton', {timeout: TIMEOUTS.FIVE_SEC}).should('be.visible').click();
        });

        // # Verify tha the updated post contians '(edited)'
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).within((el) => {
                cy.wrap(el).find('.post-edited__indicator').should('have.text', '(edited)');
            });
        });
    });

    it('MM-T2204 @ autocomplete from within edit modal', () => {
        // # Post message
        cy.get('#post_textbox').type(message1).type('{enter}').wait(TIMEOUTS.HALF_SEC);

        cy.getLastPostId().then((postId) => {
            cy.clickPostDotMenu(postId);

            // # Click edit post
            cy.get(`#edit_post_${postId}`).scrollIntoView().should('be.visible').click();

            // * Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // # Mention first two letters of sysadmin user name
            cy.get('#edit_textbox', {timeout: TIMEOUTS.FIVE_SEC}).type(' @sy').wait(TIMEOUTS.HALF_SEC);

            cy.get('#suggestionList').within(() => {
                // # Verify that the sysadmin user name is mentioned
                cy.findByText('@sysadmin').should('be.visible');
            });

            // # Close the modal
            cy.get('#editButton', {timeout: TIMEOUTS.FIVE_SEC}).should('be.visible').click();
        });
    });

    it('MM-T2227 Channel shortlinking - can edit', () => {
        // # Click the channel header
        cy.get('#channelHeaderDropdownButton button').click();

        // # Select View Info
        cy.get('#channelViewInfo button').click();

        var channelUrl;

        // # Channel URL is listed
        cy.url().then((loc) => {
            cy.contains('div.info__value', loc).should('be.visible').then((el) => {
                channelUrl = el.text();

                // # Close the modal
                cy.findAllByLabelText('Close').should('be.visible').first().click();

                // # Post message containing channel link
                cy.get('#post_textbox').type(channelUrl).type('{enter}').wait(TIMEOUTS.HALF_SEC);
            });
        });

        // # Edit post containing channel link
        cy.getLastPostId().then((postId) => {
            cy.clickPostDotMenu(postId);

            // # Click edit post
            cy.get(`#edit_post_${postId}`).scrollIntoView().should('be.visible').click();

            // * Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // # Mention first two letters of sysadmin user name
            cy.get('#edit_textbox', {timeout: TIMEOUTS.FIVE_SEC}).type(' test').wait(TIMEOUTS.HALF_SEC);

            // # Close the modal
            cy.get('#editButton', {timeout: TIMEOUTS.FIVE_SEC}).should('be.visible').click();
        });
    });
});
