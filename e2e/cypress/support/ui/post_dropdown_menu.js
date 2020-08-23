// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('uiClickCopyLink', (permalink) => {
    // # Stub on clipboard
    const clipboard = {permalink: '', wasCalled: false};
    cy.window().then((win) => {
        cy.stub(win.navigator.clipboard, 'writeText', (link) => {
            clipboard.wasCalled = true;
            clipboard.permalink = link;
        });
    });

    // * Verify initial state
    cy.wrap(clipboard).its('permalink').should('eq', '');

    // # Click on "Copy Link"
    cy.get('.dropdown-menu').should('be.visible').within(() => {
        cy.findByText('Copy Link').scrollIntoView().should('be.visible').click();

        // * Verify if it's called with correct link value
        cy.wrap(clipboard).its('wasCalled').should('eq', true);
        cy.wrap(clipboard).its('permalink').should('eq', permalink);
    });
});
