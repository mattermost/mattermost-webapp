// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
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

            cy.apiGetChannelByName(testTeam.name, 'town-square').then(({channel}) => {
                townsquareChannelId = channel.id;
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
        const message = 'This is a test message';
        cy.postMessageReplyInRHS(message);

        // * 'Jump to New Messages' is not visible
        cy.get('.toast__visible').should('not.be.visible');

        // * Message gets posted in Town Square
        cy.uiWaitUntilMessagePostedIncludes(message);
    });
});
