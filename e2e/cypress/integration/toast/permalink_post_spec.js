// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @toast

describe('Toast', () => {
    let testTeam;

    before(() => {
        cy.apiInitSetup({loginAfer: true}).then(({team}) => {
            testTeam = team;

            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('MM-T1792 Permalink post', () => {
        // # Add a message to the channel
        cy.postMessage('test');

        cy.getLastPostId().then((id) => {
            const permalink = `${Cypress.config('baseUrl')}/${testTeam.name}/pl/${id}`;

            // # Check if ... button is visible in last post right side
            cy.get(`#CENTER_button_${id}`).should('not.exist');

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

            // * Post is highlighted and fades within 6 sec.
            cy.get(`#post_${id}`).
                should('have.css', 'animation-duration', '1s').
                and('have.css', 'animation-delay', '5s').
                and('have.class', 'post--highlight');
            cy.get(`#post_${id}`).should('not.have.class', 'post--highlight');

            // * URL changes to channel url
            cy.url().should('include', `/${testTeam.name}/channels/town-square`).and('not.include', id);
        });
    });
});
