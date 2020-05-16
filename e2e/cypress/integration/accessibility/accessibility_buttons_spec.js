// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @accessibility

describe('Verify Accessibility Support in different Buttons', () => {
    before(() => {
        cy.apiLogin('sysadmin');

        // # Visit the Off Topic channel
        cy.visit('/ad-1/channels/off-topic');
        cy.findAllByTestId('postView').should('be.visible');

        // # Remove from Favorites if already set
        cy.get('#channelHeaderInfo').then((el) => {
            if (el.find('#toggleFavorite.active').length) {
                cy.get('#toggleFavorite').click();
            }
        });

        // # Post a message
        cy.postMessage(`hello from sysadmin: ${Date.now()}`);
    });

    it('MM-22624 Accessibility Support in RHS expand and close icons', () => {
        cy.getLastPostId().then((postId) => {
            cy.clickPostCommentIcon(postId);
            cy.get('#rhsContainer').should('be.visible').within(() => {
                // * Verify accessibility support in Sidebar Expand and Shrink icon
                cy.get('button.sidebar--right__expand').should('have.attr', 'aria-label', 'Expand').within(() => {
                    cy.get('.fa-expand').should('have.attr', 'aria-label', 'Expand the sidebar icon');
                    cy.get('.fa-compress').should('have.attr', 'aria-label', 'Shrink the sidebar icon');
                });

                // * Verify accessibility support in Close icon
                cy.get('#rhsCloseButton').should('have.attr', 'aria-label', 'Close').within(() => {
                    cy.get('i').should('have.attr', 'aria-label', 'Close the sidebar icon');
                });

                // # Close the sidebar
                cy.get('#rhsCloseButton').click();
            });
        });
    });

    it('MM-22624 Accessibility Support in different buttons in Channel Header', () => {
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

        // * Verify accessibility support in Flagged Posts button
        cy.get('#channelHeaderFlagButton').should('have.attr', 'aria-label', 'Flagged posts').and('have.class', 'a11y--active a11y--focused');
    });
});
