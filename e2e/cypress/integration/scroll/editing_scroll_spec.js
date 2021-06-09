// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @scroll

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Scroll', () => {
    let lastPostBeforeScroll;
    let firstPostBeforeScroll;
    let testChannelId;
    let testChannelLink;
    let otherUser;
    let multilineMessageID;

    const multilineString = `A
    multiline
    message`;
    const newMultilineMessage = `This
    is
    a new
    multiline
    message`;

    beforeEach(() => {
        cy.apiInitSetup().then(({team, channel}) => {
            testChannelId = channel.id;
            testChannelLink = `/${team.name}/channels/${channel.name}`;
            cy.apiCreateUser().then(({user: user2}) => {
                otherUser = user2;
                cy.apiAddUserToTeam(team.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannelId, otherUser.id);
                });

                cy.visit(testChannelLink);
                cy.postMessageAs({sender: otherUser, message: multilineString, channelId: testChannelId});

                // # Other user posts a multiline message
                cy.getLastPostId().then((postId) => {
                    multilineMessageID = postId;

                    // # Other user posts a few messages so that the multiline message is hidden
                    Cypress._.times(30, (postIndex) => {
                        cy.postMessageAs({sender: otherUser, message: `Other users p-${postIndex}`, channelId: testChannelId});
                    });

                    // # Scroll above the last few messages
                    cy.get('div.post-list__dynamic', {timeout: TIMEOUTS.ONE_SEC}).should('be.visible').
                        scrollTo(0, '90%', {duration: TIMEOUTS.ONE_SEC}).
                        wait(TIMEOUTS.ONE_SEC);

                    // # Get the text of the first visible post
                    cy.get('.post-message__text:visible').first().then((postMessage) => {
                        firstPostBeforeScroll = postMessage.text();
                    });

                    // # Get the text of the last visible post
                    cy.get('.post-message__text:visible').last().then((postMessage) => {
                        lastPostBeforeScroll = postMessage.text();
                    });
                });
            });
        });
    });
    it('MM-T2371 Post list does not scroll when the offscreen post is edited', () => {
        // # Edit multiline message from the other user
        cy.externalRequest({user: otherUser, method: 'PUT', path: `posts/${multilineMessageID}`, data: {id: multilineMessageID, message: newMultilineMessage}});
        checkVisiblePostsAfterChanges(firstPostBeforeScroll, lastPostBeforeScroll);
    });
    it('MM-T2372 Post list does not scroll when the offscreen post is deleted', () => {
        // # delete multiline message from the other user
        cy.externalRequest({user: otherUser, method: 'DELETE', path: `posts/${multilineMessageID}`});
        checkVisiblePostsAfterChanges(firstPostBeforeScroll, lastPostBeforeScroll);
    });
});

function checkVisiblePostsAfterChanges(firstPostBeforeScroll, lastPostBeforeScroll) {
    // # Wait for the message to be changed (edited or deleted)
    cy.wait(TIMEOUTS.ONE_SEC);

    // * Verify the first post is the same after the change
    cy.get('.post-message__text:visible').first().then((firstPostAfterScroll) => {
        expect(firstPostAfterScroll.text()).equal(firstPostBeforeScroll);
    });

    // * Verify the last post is the same after the change
    cy.get('.post-message__text:visible').last().then((lastPostAfterScroll) => {
        expect(lastPostAfterScroll.text()).equal(lastPostBeforeScroll);
    });
}
