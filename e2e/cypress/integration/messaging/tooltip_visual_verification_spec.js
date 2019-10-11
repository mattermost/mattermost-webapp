// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************
import * as TIMEOUTS from '../../fixtures/timeouts';

// Username of a test user that you want to start a DM with
let username = '';

// Function to hover over individual items
function hoverOverItem(postId, iconName, tooltipName, tooltipText, location = 'CENTER') {
    // # Get the latest post and hover over it
    cy.get(`#post_${postId}`).trigger('mouseover');

    // # Hover on the icon that you want to test
    cy.get(`#${location}_${iconName}_${postId}`).trigger('mouseover', {
        force: true,
    });

    // * When hovering on icon, tooltip should appear and text should be valid
    cy.get(`${tooltipName}`).find('span').should('have.text', tooltipText);
}

describe('M18697 - Visual verification of tooltips on post hover menu', () => {
    before(() => {
        // # Login as user-1
        cy.apiLogin('user-1');

        // # Use the API to create a new user
        cy.createNewUser().then((res) => {
            username = res.username;

            // # Start DM with new user
            cy.visit(`/ad-1/messages/@${username}`);
        });

        // # Wait a few ms for the user to be created before sending the test message
        cy.wait(TIMEOUTS.SMALL);

        // # Post test message
        cy.postMessage('Test');
    });

    it('Check dotmenu icon tooltip', () => {
        cy.getLastPostId().then((postId) => {
            hoverOverItem(postId, 'button', '#dotmenu-icon-tooltip', 'More Actions');
        });
    });

    it('Check reaction icon tooltip', () => {
        cy.getLastPostId().then((postId) => {
            hoverOverItem(postId, 'reaction', '#reaction-icon-tooltip', 'Add Reaction');
        });
    });

    it('Check comment icon tooltip', () => {
        cy.getLastPostId().then((postId) => {
            hoverOverItem(postId, 'commentIcon', '#comment-icon-tooltip', 'Reply');
        });
    });
});
