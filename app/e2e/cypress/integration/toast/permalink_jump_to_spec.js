// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// # Indicates a test step (e.g. # Go to a page)
// [*] indicates an assertion (e.g. * Check the title)
// Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @toast

describe('Toast', () => {
    let testTeam;

    before(() => {
        // # Create new team and new user
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            testTeam = team;
        });
    });

    it('MM-T1791 Permalink \'Jump to\' in Search', () => {
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Search for a term e.g.test
        const searchTerm = 'test';
        cy.postMessage(searchTerm);
        cy.get('#searchBox').type(searchTerm).type('{enter}');

        // # Click on Jump to link in search results
        cy.get('.search-item__jump').first().click();

        cy.getLastPostId().then((postId) => {
            // # Jump to link opens on main channel view
            cy.url().should('include', `/${testTeam.name}/channels/town-square/${postId}`);
            cy.get('#channelHeaderInfo').should('be.visible').and('contain', 'Town Square');

            // # Post is highlighted and fades within 6 sec.
            cy.get(`#post_${postId}`).
                should('have.css', 'animation-duration', '1s').
                and('have.css', 'animation-delay', '5s').
                and('have.class', 'post--highlight');
            cy.get(`#post_${postId}`).should('not.have.class', 'post--highlight');

            // # URL changes to channel url
            cy.url().should('include', `/${testTeam.name}/channels/town-square`).and('not.include', postId);
        });
    });
});
