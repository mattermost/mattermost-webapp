// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * Go and open story directly via path
 * @param {String} storyPath - path to story (e.g. "/story/badges--regular-badge")
 */
Cypress.Commands.add('toWidgetStory', (storyPath) => {
    cy.visit(Cypress.env('storybookUrl') + '?path=' + storyPath);

    cy.url().should('include', storyPath);
});

/**
 * Open story panel
 * @param {String} tab - either "Actions" (default) or "Knobs"
 */
Cypress.Commands.add('openStoryPanel', (tab = 'Actions') => {
    cy.get('#storybook-panel-root').should('be.visible').within((el) => {
        cy.findByText(tab).should('be.visible').click();
        cy.wrap(el);
    });
});

// ************************************************************
// iframe
// ************************************************************

/**
 * Get content of an iframe and return the root where components are being rendered
 */
Cypress.Commands.add('iframe', (selector, element) => {
    return cy.get(`iframe${selector || ''}`, {timeout: 10000}).
        should((iframe) => {
            expect(iframe.contents().find(element || 'body')).to.exist;
        }).
        then((iframe) => {
            if (element) {
                return cy.wrap(iframe.contents().find(element));
            }

            return cy.wrap(iframe.contents().find('body'));
        });
});
