// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @scroll

import * as MESSAGES from '../../fixtures/messages';
import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Scroll', () => {
    let testTeam;
    let testChannel;
    let otherUser;

    beforeEach(() => {
        // # Create new team and new user and visit Town Square channel
        cy.apiInitSetup().then(({team, channel}) => {
            testTeam = team;
            testChannel = channel;

            cy.apiCreateUser().then(({user: user2}) => {
                otherUser = user2;

                cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, otherUser.id);
                });
            });

            cy.visit(`/${testTeam.name}/channels/${channel.name}`);
        });
    });

    it('MM-T2365 Scrolling in the channel is disabled when emoji picker is open(does not affect mobile apps or browser in mobile view)', () => {
        const firstMessageInCenter = '<<This is the first post>>';
        const lastMessageInCenter = '<<This is the last post>>';
        const firstMessageInRhs = '<<This is the first comment>>';
        const lastMessageInRhs = '<<This is the last comment>>';

        // # Post a starting message
        cy.postMessage(firstMessageInCenter);

        // # Post as few as messages so that scroll bar appears in the center
        Cypress._.times(1, () => {
            cy.uiPostMessageQuickly(MESSAGES.HUGE);
        });

        // # Post the last message
        cy.postMessage(lastMessageInCenter);

        // # scoll to top in center
        cy.get('div.post-list__dynamic').should('be.visible').scrollTo('top', {duration: TIMEOUTS.ONE_SEC});

        // * Verify we scolled to top
        cy.findByText(firstMessageInCenter).should('exist').and('be.visible');
        cy.findByText(lastMessageInCenter).should('exist').and('not.be.visible');

        // # Scroll back to bottom
        cy.get('div.post-list__dynamic').should('be.visible').scrollTo('bottom', {duration: TIMEOUTS.ONE_SEC});

        // * Verify we scolled to bottom
        cy.findByText(firstMessageInCenter).should('exist').and('not.be.visible');
        cy.findByText(lastMessageInCenter).should('exist').and('be.visible');

        // # Open emoji picker for the last message
        cy.getLastPostId().then((postId) => {
            cy.clickPostReactionIcon(postId, 'CENTER');
        });

        // # Now try to scroll in the center
        cy.get('#post-list').scrollTo('top', {ensureScrollable: false, duration: TIMEOUTS.ONE_SEC});

        // * Verify that scrolling didnt happen
        cy.findByText(firstMessageInCenter).should('exist').and('not.be.visible');
        cy.findByText(lastMessageInCenter).should('exist').and('be.visible');

        // # Now write first message again so we can add reply
        cy.postMessage(firstMessageInRhs);

        // # Hit reply to the last message
        cy.getLastPostId().then((postId) => {
            cy.clickPostCommentIcon(postId);

            Cypress._.times(3, () => {
                cy.uiPostMessageQuickly(MESSAGES.HUGE, true);
            });
        });

        // # Write the last message in RHS
        cy.postMessageReplyInRHS(lastMessageInRhs);

        cy.getLastPostId().then((postId) => {
            cy.get('#rhsContainer').should('exist').within(() => {
                // # Scroll to top in RHS
                cy.get('.scrollbar--view').scrollTo('top', {duration: TIMEOUTS.ONE_SEC});

                // * Verify that we can see the top message
                cy.findByText(firstMessageInRhs).should('exist').and('be.visible');
                cy.findByText(lastMessageInRhs).should('exist').and('not.be.visible');

                // # Scroll back to bottom
                cy.get('.scrollbar--view').should('be.visible').scrollTo('bottom', {duration: TIMEOUTS.ONE_SEC});

                // * Verify we scolled to bottom
                cy.findByText(firstMessageInRhs).should('exist').and('not.be.visible');
                cy.findByText(lastMessageInRhs).should('exist').and('be.visible');

                // # Open emoji picker for the last message in RHS
                cy.clickPostReactionIcon(postId, 'RHS_COMMENT');

                // // # Scroll to top in RHS with emoji picker open
                cy.get('.scrollbar--view').scrollTo('top', {ensureScrollable: false, duration: TIMEOUTS.ONE_SEC});

                // // * Verify that scrolling didnt happen in RHS
                cy.findByText(firstMessageInRhs).should('exist').and('not.be.visible');
                cy.findByText(lastMessageInRhs).should('exist').and('be.visible');
            });
        });

        // # Now try to scroll in the center
        cy.get('#post-list').scrollTo('top', {ensureScrollable: false, duration: TIMEOUTS.ONE_SEC});

        // * Verify that scrolling didnt happen in Center
        cy.findByText(firstMessageInCenter).should('exist').and('not.be.visible');
        cy.findByText(lastMessageInRhs).should('exist').and('be.visible');

        // # Close the RHS
        cy.closeRHS();
    });

    it('MM-T2378 Channel with only a few posts opens at the bottom', () => {
        // # Post a starting message with user 1
        cy.postMessage('This is the first post');

        // # Post as few as messages so that scroll bar appears as channel name scroll hidden
        Cypress._.times(20, (postIndex) => {
            cy.postMessage(`p-${postIndex + 1}`);
        });

        // # Post the last message
        cy.postMessage('This is the last post');

        // # Reload the browser
        cy.reload();

        // * Verify that the top of the channel is scrolled past hidden
        cy.findByText(`Beginning of ${testChannel.display_name}`).should('exist').and('not.be.visible');

        // * Verify that the last message is visible implying that channel scrolled to bottom on reload
        cy.findByText('This is the last post').should('exist').and('be.visible');
    });

    it('MM-T2382 Center channel scroll', () => {
        // # Post a starting message with user 1
        cy.postMessage('This is the first post');

        // # Make enough posts so that first post is scrolled past hidden
        Cypress._.times(30, (postIndex) => {
            cy.postMessage(`p-${postIndex + 1}`);
        });

        // * Verify that we are the bottom of the channel
        cy.findByText('This is the first post').should('exist').and('not.be.visible');

        // * Make post from another user and verify that channel is scrolled down as post appear
        Cypress._.times(3, (postIndex) => {
            postMessageAndcheckIfTopMessagesAreScrolled(postIndex + 1, otherUser, testChannel.id);
        });
    });
});

function postMessageAndcheckIfTopMessagesAreScrolled(postIndex, sender, channelId) {
    // # Make posts from other user
    cy.postMessageAs({sender, message: `Other users p-${postIndex}`, channelId});

    cy.get('#post-list').should('exist').within(() => {
        // * Verify that top post are hidden behind scroll
        cy.findByText(`p-${postIndex}`).should('exist').and('not.be.visible');
        cy.findByText(`p-${postIndex + 1}`).should('exist').and('not.be.visible');

        // * Also verify that latest messages from the other user are visible
        cy.findByText(`Other users p-${postIndex}`).should('exist').and('be.visible');
    });
}
