// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {markAsUnreadFromPost, switchToChannel} from './helpers';

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @mark_as_unread

describe('Verify unread toast appears after repeated manual marking post as unread', () => {
    let otherUser;
    let firstPost;
    let secondPost;

    let offTopicChannel;
    let townSquareChannel;
    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            otherUser = user;

            cy.apiGetChannelByName(team.name, 'town-square').then(({channel}) => {
                townSquareChannel = channel;

                cy.apiGetChannelByName(team.name, 'off-topic').then((out) => {
                    offTopicChannel = out.channel;

                    // Toast only seems to appear after first visiting the channel
                    // So we need to visit the channel then navigate away
                    cy.visit(`/${team.name}/channels/town-square`);
                    switchToChannel(offTopicChannel);

                    cy.postMessageAs({
                        sender: otherUser,
                        message: 'First message',
                        channelId: townSquareChannel.id,
                    }).then((post) => {
                        firstPost = post;

                        cy.postMessageAs({
                            sender: otherUser,
                            message: 'Second message',
                            channelId: townSquareChannel.id,
                        }).then((post2) => {
                            secondPost = post2;

                            // Add posts so that scroll is available
                            Cypress._.times(30, (index) => {
                                cy.postMessageAs({
                                    sender: otherUser,
                                    message: index.toString(),
                                    channelId: townSquareChannel.id,
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    it('MM-T1429 Toast when navigating to channel with unread messages and after repeated marking as unread', () => {
        // # Switch to town square channel that has unread messages
        switchToChannel(townSquareChannel);

        // * Check that the toast is visible
        cy.get('div.toast').should('be.visible');

        // # Scroll to the bottom of the posts
        cy.get('.post-list__dynamic').scrollTo('bottom');

        // * Check that the toast is not visible
        cy.get('div.toast').should('be.not.visible');

        // # Mark the first post as unread
        markAsUnreadFromPost(firstPost);

        // * Check that the toast is now visible
        cy.get('div.toast').should('be.visible');

        // # Scroll to the bottom of the posts
        cy.get('.post-list__dynamic').scrollTo('bottom');

        // * Check that the toast is not visible
        cy.get('div.toast').should('be.not.visible');

        // # Mark the second post as unread
        markAsUnreadFromPost(secondPost);

        // * Check that the toast is now visible
        cy.get('div.toast').should('be.visible');

        // # Switch channels
        switchToChannel(offTopicChannel);

        // * Check that the toast is not visible
        cy.get('div.toast').should('be.not.visible');

        // # Switch channels back
        switchToChannel(townSquareChannel);

        // * Check that the toast is now visible
        cy.get('div.toast').should('be.visible');
    });
});
