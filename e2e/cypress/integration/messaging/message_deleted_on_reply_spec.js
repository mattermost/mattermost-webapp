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
let townsquareChannelId;

describe('Messaging', () => {
    before(() => {
        // # Login
        cy.apiLogin('user-1');

        // # Navigate to the channel and get the channelId
        cy.visit('/ad-1/channels/town-square');
        cy.getCurrentChannelId().then((id) => {
            townsquareChannelId = id;
        });
    });

    it('M18693-Delete a Message during reply, other user sees (message deleted)', () => {
        // # Type message to use
        cy.postMessageAs({sender: sysadmin, message: 'aaa', channelId: townsquareChannelId});

        // # Click Reply button
        cy.clickPostCommentIcon();

        // # Write message on reply box
        cy.get('#reply_textbox').type('123');

        // # Remove message from the other user
        cy.getLastPostId().as('postId').then((postId) => {
            cy.externalRequest({user: sysadmin, method: 'DELETE', path: `posts/${postId}`});
        });

        // # Wait for the message to be deleted and hit enter
        cy.wait(TIMEOUTS.TINY);
        cy.get('#reply_textbox').type('{enter}');

        // * Post Deleted Modal should be visible
        cy.findAllByTestId('postDeletedModal').should('be.visible');

        // # Close the modal
        cy.findAllByTestId('postDeletedModalOkButton').click();

        // * The message should not have been sent
        cy.get('#rhsPostList').should('be.empty');

        // * Textbox should still have the draft message
        cy.get('#reply_textbox').should('contain', '123');

        // # Try to post the message one more time pressing enter
        cy.get('#reply_textbox').type('{enter}');

        // * The modal should have appeared again
        cy.findAllByTestId('postDeletedModal').should('be.visible');

        // # Close the modal by hitting the OK button
        cy.findAllByTestId('postDeletedModalOkButton').click();

        // * The message should not have been sent
        cy.get('#rhsPostList').should('be.empty');

        // * Textbox should still have the draft message
        cy.get('#reply_textbox').should('contain', '123');

        // # Change to the other user and go to Town Square
        cy.apiLogin('sysadmin');
        cy.visit('/ad-1/channels/town-square');
        cy.wait(TIMEOUTS.SMALL);

        // * Post should not exist
        cy.get('@postId').then((postId) => {
            cy.get(`#post_${postId}`).should('not.exist');
        });
    });
});
