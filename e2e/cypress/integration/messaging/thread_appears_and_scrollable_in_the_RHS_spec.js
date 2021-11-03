// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
//
// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************
//
// Group: @messaging

import {postListOfMessages} from '../scroll/helpers';

describe('Thread Scrolling Inside RHS ', () => {
    let channelId;
    let channelLink;
    let mainUser;
    let otherUser;

    beforeEach(() => {
        cy.apiAdminLogin();
        cy.apiInitSetup().then(({user, team, channel}) => {
            mainUser = user;
            channelId = channel.id;
            channelLink = `/${team.name}/channels/${channel.name}`;
            cy.apiCreateUser().then(({user: user2}) => {
                otherUser = user2;
                cy.apiAddUserToTeam(team.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(channelId, otherUser.id);
                });
            });
        });
    });

    it('MM-T3293 The entire thread appears in the RHS (scrollable)', function() {
        const NUMBER_OF_REPLIES = 100;
        const NUMBER_OF_MAIN_THREAD_MESSAGES = 40;
        const FIRST_MESSAGE = 'The 1 message';
        const LAST_REPLY = 'Last Reply';

        cy.apiLogin(mainUser);

        cy.

            // # Create a thread with several replies to make it scrollable in RHS
            postMessageAs({sender: mainUser, message: FIRST_MESSAGE, channelId}).its('id').as('firstPostId').
            then((rootId) => {
                for (var i = 0; i < NUMBER_OF_REPLIES; i++) {
                    cy.postMessageAs({sender: mainUser, message: `Reply ${i}`, channelId, rootId});
                }
            }).

            // # Create enough posts from another user (not related to the thread on the same channel) to not load on a first load
            then(() => postListOfMessages({sender: otherUser, channelId, numberOfMessages: NUMBER_OF_MAIN_THREAD_MESSAGES})).

            // # Reply on original thread
            then(() => cy.postMessageAs({sender: mainUser, message: LAST_REPLY, channelId, rootId: this.firstPostId})).
            then(() => {
                // # Load the channel
                cy.visit(channelLink);

                // # Hit on reply to open thread on RHS
                cy.clickPostCommentIcon();

                // * Verify that entire thread appears in the RHS (scrollable)
                cy.uiGetRHS().within(() => {
                    cy.findByText(LAST_REPLY).should('exist');
                    checkRepliesUpFrom(NUMBER_OF_REPLIES);
                    cy.findByText(FIRST_MESSAGE).should('exist');
                });
            });
    });
});

function checkRepliesUpFrom(fromReplyNumber) {
    const currentReplyNumber = fromReplyNumber - 1;

    if (currentReplyNumber < 0) {
        return undefined;
    }

    return cy.
        findByText(`Reply ${currentReplyNumber}`).
        should('exist').
        scrollIntoView().
        then(() => checkRepliesUpFrom(currentReplyNumber));
}
