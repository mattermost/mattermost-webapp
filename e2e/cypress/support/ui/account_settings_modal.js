// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('uiOpenAccountSettingsModal', (section = '') => {
    // # Open account settings modal
    cy.uiOpenMainMenu('Account Settings');

    const accountSettingsModal = () => cy.findByRole('dialog', {name: 'Account Settings'}).should('be.visible');

    if (!section) {
        return accountSettingsModal();
    }

    // # Click on a particular section
    cy.findByRoleExtended('button', {name: section}).should('be.visible').click();

    return accountSettingsModal();
});
