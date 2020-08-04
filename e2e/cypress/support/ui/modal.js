// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('uiCloseModal', (headerLabel) => {
    // # Close modal with modal label
    cy.get('#genericModalLabel').should('have.text', headerLabel).parents().find('.modal-dialog').findByLabelText('Close').click();
});

Cypress.Commands.add('uiCloseWhatsNewModal', () => {
    // # Close "What's new" modal
    cy.uiCloseModal('What\'s new');
});
