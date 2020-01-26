// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************
import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Messaging', () => {
    before(() => {
        // # Login as user-1
        cy.apiLogin('user-1');

        // # Use the API to create a new user
        cy.createNewUser().then((res) => {
            // # Start DM with new user
            cy.visit(`/ad-1/messages/@${res.username}`);
        });

        // # Wait a few ms for the user to be created before sending the test message
        cy.wait(TIMEOUTS.SMALL);

        // # Post test message
        cy.postMessage('Test');
    });

    it('M18697 - Visual verification of tooltips on post hover menu', () => {
        cy.getLastPostId().then((postId) => {
            verifyToolTip(postId, `#CENTER_button_${postId}`, 'More Actions');

            verifyToolTip(postId, `#CENTER_reaction_${postId}`, 'Add Reaction');

            verifyToolTip(postId, `#CENTER_commentIcon_${postId}`, 'Reply');
        });
    });

    function verifyToolTip(postId, targetElement, label) {
        cy.get(`#post_${postId}`).trigger('mouseover');

        cy.get(targetElement).trigger('mouseover', {force: true});
        cy.findByText(label).should('be.visible');

        cy.get(targetElement).trigger('mouseout', {force: true});
        cy.findByText(label).should('not.be.visible');
    }
});
