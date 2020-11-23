// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

describe('Message permalink', () => {
    let testTeam;
    let testChannel;
    let testUser;
    let otherUser;

    before(() => {
        cy.apiInitSetup().then(({team, channel, user}) => {
            testTeam = team;
            testChannel = channel;
            testUser = user;

            cy.apiCreateUser().then(({user: user1}) => {
                otherUser = user1;

                cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, otherUser.id);
                });
            });

            cy.apiLogin(testUser);
        });
    });

    it('MM-T2825 - Selecting and copying multiple posts', () => {
        const testUserMessageText = 'Hello';
        const editMessageText = 'Edit';
        const otherUserMessageText = 'Hello from other user';
        const replyMessageText = 'Test reply';

        cy.visit(`/${testTeam.name}/channels/${testChannel.id}`);

        // # Post a message by the test user
        cy.postMessage(testUserMessageText);

        // * Edit message
        cy.getLastPostId().then((postId) => {
            const postText = `#postMessageText_${postId}`;
            cy.get(postText).should('have.text', testUserMessageText);

            // # Edit the last post
            cy.get('#post_textbox').type('{uparrow}');

            // * Edit post modal should appear, and edit the post
            cy.get('#editPostModal').should('be.visible');
            cy.get('#edit_textbox').should('have.text', testUserMessageText).type(editMessageText).type('{enter}');
            cy.get('#editPostModal').should('be.not.visible');

            // * Check the second post and verify that it contains new edited message.
            cy.get(postText).should('have.text', `${testUserMessageText}${editMessageText}`);
        });

        // # Post a message by second user
        cy.postMessageAs({sender: otherUser, message: otherUserMessageText, channelId: testChannel.id}).
            its('id').
            should('exist').
            as('yesterdaysPost');

        // # Reply to this message
        cy.getLastPostId().then((postId) => {
            cy.clickPostCommentIcon(postId);
            cy.get('#rhsContainer').should('be.visible');
            cy.get('#reply_textbox').should('be.visible').clear().type(replyMessageText).type('{enter}');
        });

        let document;
        let text;

        cy.get('#post-list').trigger('mousedown').then(($el) => {
            const el = $el[0];
            document = el.ownerDocument;
            const range = document.createRange();
            range.selectNodeContents(el);
            document.getSelection().removeAllRanges(range);
            document.getSelection().addRange(range);
        }).trigger('mouseup').then(() => {
            text = document.getSelection().toString();
            cy.window().then((win) => {
                // # Copy
                win.navigator.clipboard.writeText(text);

                // # Paste
                cy.wrap(win.navigator.clipboard.readText()).should('eq', text);
            });
        }).then(() => {
            cy.get('#post_textbox').focus();
            cy.get('#post_textbox').clear().type(text).type('{enter}');
        });
    });
});
