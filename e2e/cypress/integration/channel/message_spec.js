// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// [number] indicates a test step (e.g. 1. Go to a page)
// [*] indicates an assertion (e.g. * Check the title)
// Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../fixtures/users.json';
import TIMEOUTS from '../../fixtures/timeouts.js';

const sysadmin = users.sysadmin;

function shouldHavePostProfileImageVisible(isVisible = true) {
    cy.getLastPostId().then((postID) => {
        const target = `#post_${postID}`;
        if (isVisible) {
            cy.get(target).invoke('attr', 'class').
                should('contain', 'current--user').
                and('contain', 'other--root');

            cy.get(`${target} > #postContent > .post__img`).should('be.visible');
        } else {
            cy.get(target).invoke('attr', 'class').
                should('contain', 'current--user').
                and('contain', 'same--user').
                and('contain', 'same--root');

            cy.get(`${target} > #postContent > .post__img`).
                should('be.visible').
                and('be.empty');
        }
    });
}

describe('Message', () => {
    beforeEach(() => {
        // # Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/');

        // # Change settings to allow @channel messages
        cy.getCookie('MMUSERID').then((cookie) => {
            cy.request({
                headers: {'X-Requested-With': 'XMLHttpRequest'},
                url: '/api/v4/users/me/patch',
                method: 'PUT',
                body: {user_id: cookie.value, notify_props: {channel: 'true'}},
            });
        });
    });

    it('M13701 Consecutive message does not repeat profile info', () => {
        // # Wait for posts to load
        cy.get('#postListContent').should('be.visible');

        // # Post a message to force next user message to display a message
        cy.getCurrentChannelId().then((channelId) => {
            cy.postMessageAs({sender: sysadmin, message: 'Hello', channelId, baseUrl: Cypress.config('baseUrl')});
        });

        // # Post message "One"
        cy.postMessage('One');

        // * Check profile image is visible
        shouldHavePostProfileImageVisible(true);

        // # Post message "Two"
        cy.postMessage('Two');

        // * Check profile image is not visible
        shouldHavePostProfileImageVisible(false);

        // # Post message "Three"
        cy.postMessage('Three');

        // * Check profile image is not visible
        shouldHavePostProfileImageVisible(false);
    });

    it('M14012 Focus move to main input box when a character key is selected', () => {
        // # Post message
        cy.postMessage('Message');

        cy.getLastPostId().then((postId) => {
            const divPostId = `#post_${postId}`;

            // # Left click on post to move the focus out of the main input box
            cy.get(divPostId).click();

            // # Push a character key such as "A"
            cy.get('#post_textbox').type('A');

            // # Open the "..." menu on a post in the main to move the focus out of the main input box
            cy.clickPostDotMenu(postId);

            // # Push a character key such as "A"
            cy.get('#post_textbox').type('A');

            // * Focus is moved back to the main input and the keystroke is captured
            cy.focused().should('have.id', 'post_textbox');
            cy.focused().should('contain', 'AA');
        });
    });

    it('M14320 @here., @all. and @channel. (ending in a period) still highlight', () => {
        // # Login as new user
        cy.loginAsNewUser().then(() => {
            // # Create new team and visit its URL
            cy.apiCreateTeam('test-team', 'Test Team').then((response) => {
                cy.visit(`/${response.body.name}`);
            });
        });

        // # Post message
        cy.postMessage('@here. @all. @channel.');

        cy.getLastPostId().then((postId) => {
            const divPostId = `#postMessageText_${postId}`;

            // * Check that the message contains the whole content sent ie. mentions with dots.
            cy.get(divPostId).find('p').should('have.text', '@here. @all. @channel.');

            // * Check that only the at-mention are inside span.mention--highlight
            cy.get(divPostId).find('.mention--highlight').
                first().should('have.text', '@here').should('not.have.text', '.').
                next().should('have.text', '@all').should('not.have.text', '.').
                next().should('have.text', '@channel').should('not.have.text', '.');
        });
    });

    it('MM-2954 /me message should be formatted like a system message', () => {
        // # Post message
        cy.postMessage('/me hello there');

        cy.getLastPostId().then((postId) => {
            const divPostId = `#post_${postId}`;

            // * Check that message has the css class needed for system message styling
            cy.get(divPostId).should('have.class', 'post--system');
        });
    });

    it('MM-16730 Reply to an older message', () => {
        cy.getCurrentChannelId().then((channelId) => {
            // # Get yesterdays date in UTC
            const yesterdaysDate = Cypress.moment().subtract(1, 'days').valueOf();

            // # Post a day old message
            cy.postMessageAs({sender: sysadmin, message: 'Hello from yesterday', channelId, createAt: yesterdaysDate}).
                its('id').
                should('exist').
                as('yesterdaysPost');
        });

        // # Add two subsequent posts
        cy.postMessage('One');
        cy.postMessage('Two');

        cy.get('@yesterdaysPost').then((postId) => {
            // # Scroll up to yesterdays message
            cy.get(`#post_${postId}`).scrollIntoView();

            // # Open RHS comment menu
            cy.clickPostCommentIcon(postId);

            // # Upload an attachment to the reply
            cy.fileUpload('#fileUploadInput').wait(TIMEOUTS.TINY);

            // # Reply with the attachment
            cy.postMessageReplyInRHS('A reply to an older post with attachment');

            // # Get the latest reply post
            cy.getLastPostId().then((replyId) => {
                // * Verify that the reply is in the channel view with matching text
                cy.get(`#post_${replyId}`).within(() => {
                    cy.get('#postLink').should('be.visible').and('have.text', 'Commented on sysadmin\'s message: Hello from yesterday');
                    cy.get(`#postMessageText_${replyId}`).should('be.visible').and('have.text', 'A reply to an older post with attachment');
                    cy.queryByTestId('image-name').should('be.visible').and('have.text', 'mattermost-icon.png');
                });

                // * Verify that the reply is in the RHS with matching text
                cy.get(`#rhsPost_${replyId}`).within(() => {
                    cy.get('#postLink').should('not.be.visible');
                    cy.get(`#postMessageText_${replyId}`).should('be.visible').and('have.text', 'A reply to an older post with attachment');
                    cy.queryByTestId('image-name').should('be.visible').and('have.text', 'mattermost-icon.png');
                });

                cy.get(`#CENTER_time_${postId}`).find('#localDateTime').invoke('attr', 'title').then((originalTimeStamp) => {
                    // * Verify the first post timestamp equals the RHS timestamp
                    cy.get(`#RHS_ROOT_time_${postId}`).find('#localDateTime').invoke('attr', 'title').should('be', originalTimeStamp);

                    // * Verify the first post timestamp was not modified by the reply
                    cy.get(`#CENTER_time_${replyId}`).find('#localDateTime').should('have.attr', 'title').and('not.equal', originalTimeStamp);
                });
            });
        });

        // # Close RHS
        cy.closeRHS();

        // # Verify RHS is open
        cy.get('#rhsContainer').should('not.be.visible');
    });
});
