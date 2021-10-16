// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @scroll

import * as TIMEOUTS from '../../fixtures/timeouts';

import {postListOfMessages, scrollCurrentChannelFromTop} from './helpers';

describe('Scroll', () => {
    let testChannelId;
    let testChannelLink;
    let mainUser;
    let otherUser;

    beforeEach(() => {
        cy.apiAdminLogin();
        cy.apiInitSetup().then(({user, team, channel}) => {
            mainUser = user;
            testChannelId = channel.id;
            testChannelLink = `/${team.name}/channels/${channel.name}`;
            cy.apiCreateUser().then(({user: user2}) => {
                otherUser = user2;
                cy.apiAddUserToTeam(team.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannelId, otherUser.id);
                });
            });
        });
    });

    it('MM-T2372 Post list does not scroll when the offscreen post is deleted', () => {
        const multilineString = `A
            multiline
            message`;

        cy.visit(testChannelLink);

        // # Other user posts a multiline message
        cy.postMessageAs({sender: otherUser, message: multilineString, channelId: testChannelId});
        cy.getLastPostId().then((multilineMessageID) => {
            // # Main user posts a few messages so that the first message is hidden
            postListOfMessages({sender: otherUser, channelId: testChannelId});

            // # Main user scrolls to the middle so that multiline post is offscreen
            scrollCurrentChannelFromTop('90%');

            // * Delete the multiline message and verify that the channel did not scroll
            deletePostAndVerifyScroll(multilineMessageID, {user: otherUser});
        });
    });

    it('MM-T2373 Post list does not scroll when the offscreen-above post with image attachment is deleted', () => {
        cy.apiLogin(otherUser);
        cy.visit(testChannelLink);

        // # Other user posts a messages with image attachment
        postMessageWithImageAttachment().then((attachmentPostId) => {
            // # Other user posts a few messages so that the first message is hidden
            postListOfMessages({sender: otherUser, channelId: testChannelId});

            cy.apiLogin(mainUser);
            cy.visit(testChannelLink);

            // # Main user scrolls to the top to load all the messages
            scrollCurrentChannelFromTop(0);

            // # Main user scrolls to the middle so that post with attachment is offscreen above
            scrollCurrentChannelFromTop('90%');

            // * Delete the message with image attachment, and verify that the channel did not scroll
            deletePostAndVerifyScroll(attachmentPostId, {user: otherUser});
        });
    });

    it('MM-T2373 Post list does not scroll when the offscreen-below post with image attachment is deleted', () => {
        cy.apiLogin(otherUser);
        cy.visit(testChannelLink);

        // # Other user posts a few messages so that the first message is hidden
        postListOfMessages({sender: otherUser, channelId: testChannelId});

        // # Other user posts a messages with image attachment
        postMessageWithImageAttachment().then((attachmentPostId) => {
            cy.apiLogin(mainUser);
            cy.visit(testChannelLink);

            // # Main user scrolls to the middle so that post with attachment is offscreen below
            scrollCurrentChannelFromTop('65%');

            // * Delete the message with image attachment, and verify that the channel did not scroll
            deletePostAndVerifyScroll(attachmentPostId, {user: otherUser});
        });
    });
});

function postMessageWithImageAttachment() {
    cy.get('#fileUploadInput').attachFile('huge-image.jpg');
    cy.postMessage('Bla-bla-bla');
    return cy.getLastPostId();
}

function deletePostAndVerifyScroll(postId, options) {
    let firstPostBeforeScroll;
    let lastPostBeforeScroll;

    // # Get the text of the first visible post
    cy.get('.post-message__text:visible').first().then((postMessage) => {
        firstPostBeforeScroll = postMessage.text();
    });

    // # Get the text of the last visible post
    cy.get('.post-message__text:visible').last().then((postMessage) => {
        lastPostBeforeScroll = postMessage.text();
    });

    // # Remove the message
    cy.externalRequest({...options, method: 'DELETE', path: `posts/${postId}`});

    // # Wait for the message to be deleted
    cy.wait(TIMEOUTS.ONE_SEC);

    // * Verify the first post is the same after the deleting
    cy.get('.post-message__text:visible').first().then((firstPostAfterScroll) => {
        expect(firstPostAfterScroll.text()).equal(firstPostBeforeScroll);
    });

    // * Verify the last post is the same after the deleting
    cy.get('.post-message__text:visible').last().then((lastPostAfterScroll) => {
        expect(lastPostAfterScroll.text()).equal(lastPostBeforeScroll);
    });
}
