// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @toast

import {getRandomId} from '../../utils';

describe('Toast', () => {
    let testTeam;
    let otherUser;
    let townsquareChannelId;
    let postIdToJumpTo;
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

    it('MM-T1794 Permalink post view combined with New Message toast', () => {
        // # Post 30 random messages from the 'otherUser' account in Town Square
        Cypress._.times(numberOfPosts, (num) => {
            if (num === 2) {
                cy.getLastPostId().then((postId) => {
                    postIdToJumpTo = postId;
                });
            }
            cy.postMessageAs({sender: otherUser, message: `${num} ${getRandomId()}`, channelId: townsquareChannelId});
        });

        cy.getLastPostId().then((id) => {
            const permalink = `${Cypress.config('baseUrl')}/${testTeam.name}/pl/${id}`;

            // * Check that the ... button is not visible in last post right side
            cy.get(`#CENTER_button_${id}`).should('not.be.visible');

            // # Click on ... button of last post
            cy.clickPostDotMenu(id);

            // * Click on "Copy Link" and verify the permalink in clipboard is same as we formed
            cy.uiClickCopyLink(permalink);

            // # Post the permalink in the channel
            cy.postMessage(permalink);

            // # Click on permalink
            cy.getLastPost().get('.post-message__text a').last().scrollIntoView().click();

            // * check the URL should be changed to permalink post
            cy.url().should('include', `/${testTeam.name}/channels/town-square/${id}`);

            // # Scroll to the second post in the channel so that the 'Jump to New Messages' button would be visible
            cy.get(`#postMessageText_${postIdToJumpTo}`).scrollIntoView();

            // # Post two new messages as 'otherUser'
            cy.postMessageAs({sender: otherUser, message: 'Random Message', channelId: townsquareChannelId});
            cy.postMessageAs({sender: otherUser, message: 'Last Message', channelId: townsquareChannelId});

            // * Verify that the last message is currently not visible
            cy.findByText('Last Message').should('not.be.visible');

            // # Click on the 'Jump to New Messages' button
            cy.get('.toast__visible').should('be.visible').click();

            // * Verify that the last message is now visible
            cy.findByText('Last Message').should('be.visible');

            // * Verify that the URL changes to the channel url
            cy.url().should('include', `/${testTeam.name}/channels/town-square`).and('not.include', id);
        });
    });
});
