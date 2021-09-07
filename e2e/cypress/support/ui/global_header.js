// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('uiGetProductSwitchButton', () => {
    return cy.findByRole('button', {name: 'Select to open product switch menu.'}).should('be.visible');
});

Cypress.Commands.add('uiGetProductSwitchMenu', () => {
    return cy.get('.product-switcher-menu').should('be.visible');
});

Cypress.Commands.add('uiOpenProductSwitchMenu', (item = '') => {
    // # Click on product switch button
    cy.uiGetProductSwitchButton().click();

    if (!item) {
        // # Return the menu if no item is passed
        return cy.uiGetProductSwitchMenu();
    }

    // # Click on a particular item
    return cy.uiGetProductSwitchMenu().
        findByText(item).
        scrollIntoView().
        should('be.visible').
        click();
});

Cypress.Commands.add('uiGetSetStatusButton', () => {
    return cy.findByRole('button', {name: 'set status'}).should('be.visible');
});

Cypress.Commands.add('uiGetStatusMenuContainer', (options = {exist: true}) => {
    if (options.exist) {
        return cy.get('#statusDropdownMenu').should('exist');
    }

    return cy.get('#statusDropdownMenu').should('not.exist');
});

Cypress.Commands.add('uiGetStatusMenu', (options = {visible: true}) => {
    if (options.visible) {
        return cy.uiGetStatusMenuContainer().
            find('.dropdown-menu').
            should('be.visible');
    }

    return cy.uiGetStatusMenuContainer().
        find('.dropdown-menu').
        should('not.be.visible');
});

Cypress.Commands.add('uiOpenUserMenu', (item = '') => {
    // # Click on user status button
    cy.uiGetSetStatusButton().click();

    if (!item) {
        // # Return the menu if no item is passed
        return cy.uiGetStatusMenu();
    }

    // # Click on a particular item
    return cy.uiGetStatusMenu().
        findByText(item).
        scrollIntoView().
        should('be.visible').
        click();
});

Cypress.Commands.add('uiGetSettingsButton', () => {
    return cy.findByRole('button', {name: 'Select to open the settings modal.'}).should('be.visible');
});

Cypress.Commands.add('uiOpenSettingsModal', (section = '') => {
    // # Open settings modal
    cy.uiGetSettingsButton().click();

    const settingsModal = () => cy.findByRole('dialog', {name: 'Settings'}).should('be.visible');

    if (!section) {
        return settingsModal();
    }

    // # Click on a particular section
    cy.findByRoleExtended('button', {name: section}).should('be.visible').click();

    return settingsModal();
});
