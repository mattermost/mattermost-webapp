// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @scroll

import * as TIMEOUTS from '../../fixtures/timeouts';

import {postMessagesAndScrollUp} from './helpers';

describe('Scroll', () => {
    let firstPostBeforeScroll;
    let lastPostBeforeScroll;
    let testChannelId;
    let testChannelLink;
    let mainUser;
    let otherUser;

    const multilineString = `A
    multiline
    message`;

    before(() => {
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
            cy.visit(testChannelLink);
        });
    });

    it('MM-T2372 Post list does not scroll when the offscreen post is deleted', () => {
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

            // # Remove multiline message from the other user
            cy.externalRequest({user: otherUser, method: 'DELETE', path: `posts/${multilineMessageID}`});

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
        });
    });

    it('MM-T2373 Post list does not scroll when the offscreen post with image attachment is deleted', () => {
        const filename = 'huge-image.jpg';

        cy.apiLogin(otherUser);
        cy.visit(testChannelLink);
        cy.get('#fileUploadInput').attachFile(filename);
        cy.postMessage('Bla-bla-bla');

        cy.apiLogin(mainUser);
        cy.visit(testChannelLink);
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

            // # Remove multiline message from the other user
            cy.externalRequest({user: otherUser, method: 'DELETE', path: `posts/${multilineMessageID}`});

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
        });
    });
});
