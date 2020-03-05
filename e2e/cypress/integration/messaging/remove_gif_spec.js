// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../fixtures/timeouts';
import users from '../../fixtures/users.json';

const sysadmin = users.sysadmin;

describe('Messaging', () => {
    before(() => {
        // # Set the configuration on Link Previews
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableLinkPreviews: true,
            },
        });

        // # Login and setup link preferences
        cy.apiLogin('user-1');
        cy.apiSaveShowPreviewPreference();
        cy.apiSavePreviewCollapsedPreference('false');

        // # Login and go to /
        cy.apiLogin('sysadmin');
        cy.visit('/ad-1/channels/town-square');
    });

    it('M18692-Delete a GIF from RHS reply thread, other user viewing in center and RHS sees GIF preview disappear from both', () => {
        cy.visit('/ad-1/channels/town-square');

        // # Type message to use
        cy.postMessage('123');

        // # Click Reply button
        cy.clickPostCommentIcon();

        // # Write message on reply box
        cy.postMessageReplyInRHS('https://media1.giphy.com/media/l41lM6sJvwmZNruLe/giphy.gif');

        // # Change user and go to Town Square
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');

        // # Wait for the page to be loaded
        cy.wait(TIMEOUTS.SMALL);

        // # Click Reply button to open the RHS
        cy.clickPostCommentIcon();

        // # Remove message from the other user
        cy.getLastPostId().as('postId').then((postId) => {
            // * Can view the gif on main view
            cy.get(`#post_${postId}`).find('.attachment__image').should('exist');

            // * Can view the gif on RHS
            cy.get(`#rhsPost_${postId}`).find('.attachment__image').should('exist');

            // # Delete the message
            cy.externalRequest({user: sysadmin, method: 'DELETE', path: `posts/${postId}`});

            // # Wait for the message to be deleted
            cy.wait(TIMEOUTS.TINY);

            // * Cannot view the gif on main channel
            cy.get(`#post_${postId}`).find('.attachment__image').should('not.exist');

            // * Should see (message deleted)
            cy.get(`#post_${postId}`).should('contain', '(message deleted');

            // * Cannot view the gif on RHS
            cy.get(`#rhsPost_${postId}`).find('.attachment__image').should('not.exist');

            // * Should see (message deleted)
            cy.get(`#rhsPost_${postId}`).should('contain', '(message deleted');

            // # Refresh the website and wait for it to be loaded
            cy.reload();
            cy.wait(TIMEOUTS.SMALL);

            // * The RHS is closed
            cy.get('#rhsCloseButton').should('not.exist');

            // * Should see (message deleted)
            cy.get(`#post_${postId}`).should('not.exist');

            // # Log in as the other user and go to town square
            cy.apiLogin('sysadmin');
            cy.visit('/ad-1/channels/town-square');

            // * The post should not exist
            cy.get(`#post_${postId}`).should('not.exist');
        });
    });

    it('M18692-Delete a GIF from RHS reply thread, other user viewing in center and RHS sees GIF preview disappear from both (mobile view)', () => {
        cy.apiLogin('sysadmin');
        cy.visit('/ad-1/channels/town-square');

        // # Type message to use
        cy.postMessage('123');

        // # Click Reply button
        cy.clickPostCommentIcon();

        // # Write message on reply box
        cy.postMessageReplyInRHS('https://media1.giphy.com/media/l41lM6sJvwmZNruLe/giphy.gif');

        // # Change user and go to Town Square
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');

        // # Change viewport so it has mobile view
        cy.viewport('iphone-6');

        // # Click Reply button to open the Message Details
        cy.clickPostCommentIcon();

        // # Remove message from the other user
        cy.getLastPostId().as('postId').then((postId) => {
            // * Can view the gif on Message Details
            cy.get(`#rhsPost_${postId}`).find('.attachment__image').should('exist').and('be.visible');

            // # Close Message Details
            cy.get('#sbrSidebarCollapse').click();

            // * Can view the gif on main view
            cy.get(`#post_${postId}`).find('.attachment__image').should('exist').and('be.visible');

            // # Click Reply button to open the Message Details
            cy.clickPostCommentIcon();

            // # Delete the message
            cy.externalRequest({user: sysadmin, method: 'DELETE', path: `posts/${postId}`});

            // # Wait for the message to be deleted
            cy.wait(TIMEOUTS.TINY);

            // * Cannot view the gif on main channel
            cy.get(`#post_${postId}`).find('.attachment__image').should('not.exist');

            // * Cannot view the gif on RHS
            cy.get(`#rhsPost_${postId}`).find('.attachment__image').should('not.exist');

            // # Log in as the other user and go to town square
            cy.apiLogin('sysadmin');
            cy.visit('/ad-1/channels/town-square');

            // * The post should not exist
            cy.get(`#post_${postId}`).should('not.exist');
        });
    });
});
