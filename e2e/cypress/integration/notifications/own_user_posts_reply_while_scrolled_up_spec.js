// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @notifications

import {getRandomId} from '../../utils';

describe('Notifications', () => {
    let testTeam;
    let otherUser;
    let townsquareChannelId;
    const numberOfPosts = 30;

    before(() => {
        cy.apiInitSetup().then(({team}) => {
            testTeam = team;

            cy.apiCreateUser().then(({user}) => {
                otherUser = user;
                cy.apiAddUserToTeam(testTeam.id, otherUser.id);
            });

            cy.apiGetChannelByName(testTeam.name, 'town-square').then((res) => {
                townsquareChannelId = res.body.id;
            });

            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('MM-T564 New message bar - Own user posts a reply while scrolled up in a channel', () => {
        // # Post 30 random messages from the 'otherUser' account in Town Square
        Cypress._.times(numberOfPosts, (num) => {
            cy.postMessageAs({sender: otherUser, message: `${num} ${getRandomId()}`, channelId: townsquareChannelId});
        });

        // # Click on the post comment icon of the last message
        cy.clickPostCommentIcon();

        // # Scroll to the top of the channel so that the 'Jump to New Messages' button would be visible (if it existed)
        cy.get('.post-list__dynamic').scrollTo('top');

        // # Post a reply in RHS
        cy.postMessageReplyInRHS('This is a test message');

        cy.getLastPostId().then((postId) => {
            // * Verify that 'Jump to New Messages' is not visible and that the new reply exists in the channel
            cy.get('.toast__visible').should('not.be.visible');
            cy.get(`#postMessageText_${postId}`).should('exist');
        });
    });
});
