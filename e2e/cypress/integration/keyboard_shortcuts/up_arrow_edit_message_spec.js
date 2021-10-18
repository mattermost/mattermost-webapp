// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @keyboard_shortcuts

describe('Keyboard Shortcuts', () => {
    let testTeam;
    let testChannel;
    let testUser;
    let otherUser;

    before(() => {
        cy.apiInitSetup().then(({team, channel, user}) => {
            testTeam = team;
            testChannel = channel;
            testUser = user;

            cy.apiCreateUser({prefix: 'other'}).then(({user: user1}) => {
                otherUser = user1;

                cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, otherUser.id);
                });
            });
        });
    });

    it('MM-T1235 Arrow up key - no Edit modal open up if user has not posted any message yet', () => {
        const message2 = 'Test message from User 2';

        cy.apiLogin(otherUser);

        // # Visit the channel using the channel name
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Post message in the channel from User 2
        cy.postMessage(message2);
        cy.apiLogout();

        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Press UP arrow
        cy.get('#post_textbox').type('{uparrow}');

        // * Verify that Edit modal should not be visible
        cy.get('#editPostModal').should('not.exist');
    });

    it('MM-T1236 Arrow up key - Edit modal open up for own message of a user', () => {
        const message1 = 'Test message from User 1';
        const message2 = 'Test message from User 2';

        cy.apiLogin(testUser);

        // # Visit the channel using the channel name
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Post message in the channel from User 1
        cy.postMessage(message1);
        cy.apiLogout();

        cy.apiLogin(otherUser);

        // # Visit the channel using the channel name
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Post message in the channel from User 2
        cy.postMessage(message2);
        cy.apiLogout();

        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Press UP arrow
        cy.get('#post_textbox').type('{uparrow}');

        // * Verify that the Edit Post Modal is visible
        cy.get('#editPostModal').should('be.visible');

        // * Verify that the Edit textbox contains previously sent message by user 1
        cy.get('#edit_textbox').should('have.text', message1);
    });

    it('MM-T1272 Arrow up key - Removing all text in edit deletes reply', () => {
        const message = 'Test message from User 1';
        const reply = 'Reply from User 1';

        cy.apiLogin(testUser);

        // # Visit the channel using the channel name
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Post message in the channel from User 1
        cy.postMessage(message);

        // # Reply to message
        cy.getLastPostId().then((postId) => {
            cy.clickPostCommentIcon(postId);
            cy.postMessageReplyInRHS(reply);
        });

        cy.getLastPostId().then((postID) => {
            // # Press UP arrow
            cy.get('#post_textbox').type('{uparrow}');

            // # Clear message and type ENTER
            cy.get('#edit_textbox').clear().type('{enter}');

            // * Delete post confirmation modal should be visible
            cy.get('#deletePostModal').should('be.visible');

            // # Confirm delete
            cy.get('#deletePostModalButton').click();

            // * Assert post message disappears
            cy.get(`#postMessageText_${postID}`).should('not.exist');
        });
    });
});
