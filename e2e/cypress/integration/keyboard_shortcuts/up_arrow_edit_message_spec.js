// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.


// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @keyboard_shortcuts

import * as TIMEOUTS from '../../fixtures/timeouts';

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

    beforeEach(() => {
        cy.apiLogin(testUser);

        // # Visit the channel using the channel name
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
    });

    it('MM-T1236 Arrow up key - Edit modal open up for own message of a user', () => {
        const message1 = 'Test message from User 1';
        const message2 = 'Test message from User 2';

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

    it('MM-T1271 UP - Removing all text in edit deletes post', () => {
        // # Post message in center from otheruser
        const message = 'Message to be deleted from other user';
        cy.postMessageAs({sender: otherUser, message, channelId: testChannel.id});
        cy.uiWaitUntilMessagePostedIncludes(message);

        // * Verify that testuser sees post
        cy.getLastPostId().then((postID) => {
            cy.get(`#postMessageText_${postID}`).should('contain', message);
        });

        // # Other usesr deletes post
        cy.getLastPostId().then((postID) => {
            cy.externalRequest({
                user: otherUser,
                method: 'DELETE',
                path: `posts/${postID}`,
            });

            // * Assert the testuser sees that message is deleted
            cy.get(`#post_${postID}`).should('contain', '(message deleted)');
        });

        // # Login with other user
        cy.apiLogout();
        cy.apiLogin(otherUser);
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        cy.postMessage(message);
        cy.uiWaitUntilMessagePostedIncludes(message);

        cy.getLastPostId().then((postID) => {
            cy.get('#post_textbox').type('{uparrow}');

            // * Validate that edit box contains just posted message
            cy.get('#edit_textbox').should('have.text', message);

            // # Mark all text, delete and confirm by pressing enter
            cy.wait(TIMEOUTS.HALF_SEC);
            cy.get('#edit_textbox').clear();
            cy.wait(TIMEOUTS.HALF_SEC);
            cy.get('#edit_textbox').type('{enter}');

            // * Verify confirm modal is shown
            cy.waitUntil(() => cy.get('#deletePostModal').should('be.visible'));

            // # Press enter on confirm dialog
            cy.get('#deletePostModalButton').click();

            // * Verify post is deleted
            cy.get(`#postMessageText_${postID}`).should('not.exist');
        });
    });
});
