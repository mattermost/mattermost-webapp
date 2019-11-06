// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. #. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/**
 * Note: This test requires storybook to be running.
 * Run it by: `npm run storybook`
 */

/* eslint-disable max-nested-callbacks */

describe('Widgets - Popover', () => {
    before(() => {
        // # Go to widget story and verify that it renders regular badge
        cy.toWidgetStory('/story/popover--basic-popover');

        cy.queryByText('some').should('exist');
    });

    it('verify UI', () => {
        // # Get the root of the iframe where the component is rendered
        cy.iframe('#storybook-preview-iframe', '#root').as('iframeRoot');

        cy.get('@iframeRoot').should('be.visible').within(() => {
            // * Verify .popover is visible and its CSS properties
            cy.get('.popover').should('be.visible').
                and('have.css', 'margin-left', '10px');
        });
    });
});
