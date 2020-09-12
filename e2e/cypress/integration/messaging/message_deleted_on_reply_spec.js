// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

import * as TIMEOUTS from '../../fixtures/timeouts';
import {getAdminAccount} from '../../support/env';

describe('Messaging', () => {
    const admin = getAdminAccount();
    let testChannelId;
    let testChannelLink;

    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            testChannelId = channel.id;
            testChannelLink = `/${team.name}/channels/${channel.name}`;
            cy.visit(testChannelLink);
        });
    });

    it('MM-T113 Delete a Message during reply, other user sees "(message deleted)"', () => {
        // # Type message to use
        cy.postMessageAs({sender: admin, message: 'aaa', channelId: testChannelId});

        // # Click Reply button
        cy.clickPostCommentIcon();

        // # Write message on reply box
        cy.get('#reply_textbox').type('123');

        // # Remove message from the other user
        cy.getLastPostId().as('postId').then((postId) => {
            cy.externalRequest({user: admin, method: 'DELETE', path: `posts/${postId}`});
        });

        // # Wait for the message to be deleted and hit enter
        cy.wait(TIMEOUTS.HALF_SEC);
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
        cy.apiAdminLogin();
        cy.visit(testChannelLink);
        cy.wait(TIMEOUTS.FIVE_SEC);

        // * Post should not exist
        cy.get('@postId').then((postId) => {
            cy.get(`#post_${postId}`).should('not.exist');
        });
    });
});
