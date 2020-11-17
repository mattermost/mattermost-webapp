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

describe('Widgets - Badges', () => {
    before(() => {
        cy.requireStorybookServer();

        // # Go to widget story and verify that it renders regular badge
        cy.toWidgetStory('/story/badges--regular-badge');
        cy.get('.sidebar-container').should('be.visible').within(() => {
            cy.findByText('regular badge').should('exist');
        });
    });

    it('verify UI', () => {
        // # Get the root of the iframe where the component is rendered
        cy.iframe('#storybook-preview-iframe', '#root').as('iframeRoot');

        cy.get('@iframeRoot').should('be.visible').within(() => {
            // * Verify .Badge is visible and its CSS properties
            cy.get('.Badge').should('be.visible').
                and('have.css', 'margin', '0px 0px 0px 4px').
                and('have.css', 'display', 'inline-flex').
                and('have.css', 'align-items', 'center');

            // * Verify .Badge__box is visible, text and its CSS properties
            cy.get('.Badge__box').should('be.visible').
                and('have.text', 'BADGE').
                and('have.css', 'border-radius', '2px').
                and('have.css', 'font-size', '10px').
                and('have.css', 'font-weight', '600').
                and('have.css', 'padding', '1px 4px').
                and('have.css', 'line-height', '14px').
                and('have.css', 'background-color', 'rgba(61, 60, 64, 0.16)');
        });
    });

    it('verify text change', () => {
        // # Get the root of the iframe where the component is rendered
        cy.iframe('#storybook-preview-iframe', '#root').as('iframeRoot');

        cy.get('@iframeRoot').should('be.visible').within(() => {
            // * Verify initial text
            cy.get('.Badge__box').should('be.visible').and('have.text', 'BADGE');
        });

        cy.openStoryPanel('Knobs').then(() => {
            // # Change text and verify changes on component
            const newText = 'SYSTEM';
            cy.get('#Text').clear().type(newText);
            cy.get('@iframeRoot').should('be.visible').within(() => {
                cy.get('.Badge__box').should('have.text', newText);
            });
        });
    });

    it('verify hide and show', () => {
        // # Get the root of the iframe where the component is rendered
        cy.iframe('#storybook-preview-iframe', '#root').as('iframeRoot');

        cy.get('@iframeRoot').should('be.visible').within(() => {
            cy.get('.Badge').should('be.visible');
        });

        cy.openStoryPanel('Knobs').then(() => {
            // # Uncheck "Show" and verify that the badge is hidden
            cy.get('#Show').uncheck().should('be.not.checked');
            cy.get('@iframeRoot').should('be.visible').within(() => {
                cy.get('.Badge').should('not.exist');
            });

            // # Check "Show" and verify that the badge is shown
            cy.get('#Show').check().should('be.checked');
            cy.get('@iframeRoot').should('be.visible').within(() => {
                cy.get('.Badge').should('exist');
            });
        });
    });
});
