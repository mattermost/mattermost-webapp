// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @scroll

import * as TIMEOUTS from '../../fixtures/timeouts';

import {postMessagesAndScrollUp} from './helpers';

describe('Scroll', () => {
    let firstPostBeforeScroll;
    let lastPostBeforeScroll;
    let testChannelId;
    let testChannelLink;
    let otherUser;

    const multilineString = `A
    multiline
    message`;
    const newMultilineMessage = `This
    is
    a new
    multiline
    message`;

    before(() => {
        cy.apiInitSetup().then(({team, channel}) => {
            testChannelId = channel.id;
            testChannelLink = `/${team.name}/channels/${channel.name}`;
            cy.apiCreateUser().then(({user: user2}) => {
                otherUser = user2;
                cy.apiAddUserToTeam(team.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannelId, otherUser.id);
                });
            });
            cy.visit(testChannelLink);
        });
    });

    it('MM-T2371 Post list does not scroll when the offscreen post is edited', () => {
        // # Other user posts a multiline message
        cy.postMessageAs({sender: otherUser, message: multilineString, channelId: testChannelId});

        cy.getLastPostId().then((postId) => {
            const multilineMessageID = postId;

            postMessagesAndScrollUp(otherUser, testChannelId);

            // # Get the text of the first visible post
            cy.get('.post-message__text:visible').first().then((postMessage) => {
                firstPostBeforeScroll = postMessage.text();
            });

            // # Get the text of the last visible post
            cy.get('.post-message__text:visible').last().then((postMessage) => {
                lastPostBeforeScroll = postMessage.text();
            });

            // # Edit a multiline message from the other user
            cy.externalRequest({user: otherUser, method: 'PUT', path: `posts/${multilineMessageID}`, data: {id: multilineMessageID, message: newMultilineMessage}});

            // # Wait for the message to be edited
            cy.wait(TIMEOUTS.ONE_SEC);

            // * Verify the first post is the same after the editing
            cy.get('.post-message__text:visible').first().then((firstPostAfterScroll) => {
                expect(firstPostAfterScroll.text()).equal(firstPostBeforeScroll);
            });

            // * Verify the last post is the same after the editing
            cy.get('.post-message__text:visible').last().then((lastPostAfterScroll) => {
                expect(lastPostAfterScroll.text()).equal(lastPostBeforeScroll);
            });
        });
    });
});
