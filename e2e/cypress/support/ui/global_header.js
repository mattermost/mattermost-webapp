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

Cypress.Commands.add('uiGetProfileHeader', () => {
    return cy.uiGetSetStatusButton().parent();
});

Cypress.Commands.add('uiGetStatusMenuContainer', (options = {exist: true}) => {
    if (options.exist) {
        return cy.findByRole('menu').should('exist');
    }

    return cy.findByRole('menu').should('not.exist');
});

Cypress.Commands.add('uiGetStatusMenu', (options = {visible: true}) => {
    if (options.visible) {
        return cy.uiGetStatusMenuContainer().
            find('ul').
            should('be.visible');
    }

    return cy.uiGetStatusMenuContainer().
        find('ul').
        should('not.be.visible');
});

Cypress.Commands.add('uiOpenHelpMenu', (item = '') => {
    // # Click on help status button
    cy.uiGetHelpButton().click();

    if (!item) {
        // # Return the menu if no item is passed
        return cy.uiGetHelpMenu();
    }

    // # Click on a particular item
    return cy.uiGetHelpMenu().
        findByText(item).
        scrollIntoView().
        should('be.visible').
        click();
});

Cypress.Commands.add('uiGetHelpButton', () => {
    return cy.findByRole('button', {name: 'Select to toggle the help menu.'}).should('be.visible');
});

Cypress.Commands.add('uiGetHelpMenu', (options = {visible: true}) => {
    const dropdown = () => cy.get('#helpMenuPortal').find('.dropdown-menu');

    if (options.visible) {
        return dropdown().should('be.visible');
    }

    return dropdown().should('not.be.visible');
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

Cypress.Commands.add('uiGetSearchContainer', () => {
    return cy.get('#searchFormContainer').should('be.visible');
});

Cypress.Commands.add('uiGetSearchBox', () => {
    return cy.get('#searchBox').should('be.visible');
});

Cypress.Commands.add('uiGetRecentMentionButton', () => {
    return cy.findByRole('button', {name: 'Select to toggle a list of recent mentions.'}).should('be.visible');
});

Cypress.Commands.add('uiGetSavedPostButton', () => {
    return cy.findByRole('button', {name: 'Select to toggle a list of saved posts.'}).should('be.visible');
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

Cypress.Commands.add('uiLogout', () => {
    // # Click logout via user menu
    cy.uiOpenUserMenu('Log Out');

    cy.url().should('include', '/login');
    cy.get('#site_name').should('be.visible');
    cy.get('#site_description').should('be.visible');
});
