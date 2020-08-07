// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @channel

describe('Channels', () => {
    let testTeam;
    let testUser;

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;
            testUser = user;

            cy.apiLogin(testUser);
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('MM-T1792 Permalink post', () => {
        // # Add a message to the channel
        cy.postMessage('test');

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

            // # Get the first message in the channel
            cy.getNthPostId(1).then((postId) => {
                // # Click on permalink
                cy.get('.post-message__text a').last().scrollIntoView().click();

                // * check the URL should be changed to permalink post
                cy.url().should('include', `/${testTeam.name}/channels/town-square/${postId}`);

                // * Post is highlighted and fades within 6 sec.
                cy.get(`#post_${postId}`).
                    should('have.css', 'animation-duration', '1s').
                    and('have.css', 'animation-delay', '5s').
                    and('have.class', 'post--highlight');
                cy.get(`#post_${postId}`).should('not.have.class', 'post--highlight');

                // * URL changes to channel url
                cy.url().should('include', `/${testTeam.name}/channels/town-square`).and('not.include', postId);
            });
        });
    });
});
