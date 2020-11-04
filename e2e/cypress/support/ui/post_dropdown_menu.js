// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {stubClipboard} from '../../utils';

Cypress.Commands.add('uiClickCopyLink', (permalink) => {
    stubClipboard().as('clipboard');

    // * Verify initial state
    cy.get('@clipboard').its('contents').should('eq', '');

    // # Click on "Copy Link"
    cy.get('.dropdown-menu').should('be.visible').within(() => {
        cy.findByText('Copy Link').scrollIntoView().should('be.visible').click();

        // * Verify if it's called with correct link value
        cy.get('@clipboard').its('wasCalled').should('eq', true);
        cy.get('@clipboard').its('contents').should('eq', permalink);
    });
});

Cypress.Commands.add('uiClickPostDropdownMenu', (postId, menuItem, location = 'CENTER') => {
    cy.clickPostDotMenu(postId, location);
    cy.findByTestId(`post-menu-${postId}`).should('be.visible');
    cy.findByText(menuItem).scrollIntoView().should('be.visible').click({force: true});
});
