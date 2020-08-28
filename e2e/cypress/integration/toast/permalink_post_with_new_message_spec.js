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
    let testUser;
    let townsquareChannelId;
    let postIdToJumpTo;
    const numberOfPosts = 30;

    before(() => {
        cy.apiInitSetup().then(({team}) => {
            testTeam = team;

            cy.apiCreateUser().then(({user}) => {
                testUser = user;
                cy.apiAddUserToTeam(testTeam.id, testUser.id);
            });

            cy.apiGetChannelByName(testTeam.name, 'town-square').then((res) => {
                townsquareChannelId = res.body.id;
            });

            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('MM-T1792 Permalink post', () => {
        Cypress._.times(numberOfPosts, (num) => {
            if (num === 2) {
                cy.getLastPostId().then((postId) => {
                    postIdToJumpTo = postId;
                });
            }
            cy.postMessageAs({sender: testUser, message: `${num} ${getRandomId()}`, channelId: townsquareChannelId});
        });

        cy.getLastPostId().then((id) => {
            const permalink = `${Cypress.config('baseUrl')}/${testTeam.name}/pl/${id}`;

            // # Check if ... button is visible in last post right side
            cy.get(`#CENTER_button_${id}`).should('not.be.visible');

            // # Click on ... button of last post
            cy.clickPostDotMenu(id);

            // * Click on "Copy Link" and verify the permalink in clipboard is same as we formed
            cy.uiClickCopyLink(permalink);

            // # post the permalink in the channel
            cy.postMessage(permalink);

            // # Click on permalink
            cy.getLastPost().get('.post-message__text a').last().scrollIntoView().click();

            // * check the URL should be changed to permalink post
            cy.url().should('include', `/${testTeam.name}/channels/town-square/${id}`);
            cy.get(`#postMessageText_${postIdToJumpTo}`).scrollIntoView();

            cy.postMessageAs({sender: testUser, message: 'Random Message', channelId: townsquareChannelId});
            cy.postMessageAs({sender: testUser, message: 'Last Message', channelId: townsquareChannelId});

            cy.findByText('Last Message').should('not.be.visible');

            cy.get('.toast__visible').should('be.visible').click();

            // * URL changes to channel url
            cy.findByText('Last Message').should('be.visible');

            cy.url().should('include', `/${testTeam.name}/channels/town-square`).and('not.include', id);
        });
    });
});
