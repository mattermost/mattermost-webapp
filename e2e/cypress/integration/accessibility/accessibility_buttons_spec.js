// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @accessibility

describe('Verify Accessibility Support in different Buttons', () => {
    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/off-topic`);

            // # Post a message
            cy.postMessage(`hello from test user: ${Date.now()}`);
        });
    });

    it('MM-T1459 Accessibility Support in RHS expand and close icons', () => {
        cy.getLastPostId().then((postId) => {
            cy.clickPostCommentIcon(postId);
            cy.get('#rhsContainer').should('be.visible').within(() => {
                // * Verify accessibility support in Sidebar Expand and Shrink icon
                cy.get('button.sidebar--right__expand').should('have.attr', 'aria-label', 'Expand').within(() => {
                    cy.get('.icon-arrow-expand').should('have.attr', 'aria-label', 'Expand Sidebar Icon');
                    cy.get('.icon-arrow-collapse').should('have.attr', 'aria-label', 'Collapse Sidebar Icon');
                });

                // * Verify accessibility support in Close icon
                cy.get('#rhsCloseButton').should('have.attr', 'aria-label', 'Close').within(() => {
                    cy.get('.icon-close').should('have.attr', 'aria-label', 'Close Sidebar Icon');
                });

                // # Close the sidebar
                cy.get('#rhsCloseButton').click();
            });
        });
    });

    it('MM-T1461 Accessibility Support in different buttons in Channel Header', () => {
        // # Ensure the focus is on the Toggle Favorites button
        cy.get('#toggleFavorite').focus().tab({shift: true}).tab();

        // * Verify accessibility support in Favorites button
        cy.get('#toggleFavorite').should('have.attr', 'aria-label', 'add to favorites').and('have.class', 'a11y--active a11y--focused').click();

        // * Verify accessibility support if Channel is added to Favorites
        cy.get('#toggleFavorite').should('have.attr', 'aria-label', 'remove from favorites');

        // # Ensure the focus is on the Toggle Favorites button
        cy.get('#toggleFavorite').focus().tab({shift: true}).tab();

        // # Press tab until the focus is on the Pinned posts button
        cy.focused().tab().tab().tab().tab();

        // * Verify accessibility support in Pinned Posts button
        cy.get('#channelHeaderPinButton').should('have.attr', 'aria-label', 'Pinned posts').and('have.class', 'a11y--active a11y--focused').tab();

        // * Verify accessibility support in Search input
        cy.get('#searchBox').should('have.attr', 'aria-label', 'Search').and('have.class', 'a11y--active a11y--focused').tab();

        // * Verify accessibility support in Recent Mentions button
        cy.get('#channelHeaderMentionButton').should('have.attr', 'aria-label', 'Recent mentions').and('have.class', 'a11y--active a11y--focused').tab();

        // * Verify accessibility support in Saved Posts button
        cy.get('#channelHeaderFlagButton').should('have.attr', 'aria-label', 'Saved posts').and('have.class', 'a11y--active a11y--focused');
    });
});
