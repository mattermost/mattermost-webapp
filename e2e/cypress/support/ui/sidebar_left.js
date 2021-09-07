// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('uiGetLHS', () => {
    return cy.get('#SidebarContainer').should('be.visible');
});

Cypress.Commands.add('uiGetLHSHeader', () => {
    return cy.uiGetLHS().
        find('.SidebarHeaderMenuWrapper').
        should('be.visible');
});

Cypress.Commands.add('uiOpenTeamMenu', (item = '') => {
    // # Click on LHS header
    cy.uiGetLHSHeader().click();

    if (!item) {
        // # Return the menu if no item is passed
        return cy.uiGetLHSTeamMenu();
    }

    // # Click on a particular item
    return cy.uiGetLHSTeamMenu().
        findByText(item).
        scrollIntoView().
        should('be.visible').
        click();
});

Cypress.Commands.add('uiGetLHSAddChannelButton', () => {
    return cy.uiGetLHS().
        findByRole('button', {name: 'Add Channel Dropdown'});
});

Cypress.Commands.add('uiGetLHSTeamMenu', () => {
    return cy.uiGetLHS().find('#sidebarDropdownMenu');
});

Cypress.Commands.add('uiGetLhsSection', (section) => {
    if (section === 'UNREADS') {
        return cy.findByText(section).
            parent().
            parent().
            parent();
    }

    return cy.findAllByRole('button', {name: section}).
        first().
        parent().
        parent().
        parent();
});

Cypress.Commands.add('uiBrowseOrCreateChannel', (item) => {
    cy.findByRole('button', {name: 'Add Channel Dropdown'}).
        should('be.visible').
        click();
    cy.get('.dropdown-menu').should('be.visible');

    if (item) {
        cy.findByRole('menuitem', {name: item});
    }
});

Cypress.Commands.add('uiAddDirectMessage', () => {
    return cy.findByRole('button', {name: 'Write a direct message'});
});

Cypress.Commands.add('uiGetChannelSwitcher', () => {
    return cy.get('#lhsNavigator').findByRole('button', {name: 'Channel Switcher'});
});

Cypress.Commands.add('uiGetChannelSidebarMenu', (channelName) => {
    cy.get(`#sidebarItem_${channelName}`).
        find('.SidebarMenu_menuButton').
        click({force: true});

    return cy.get('.dropdown-menu').should('be.visible');
});

Cypress.Commands.add('uiVisitSidebarItem', (name) => {
    cy.get(`#sidebarItem_${name}`).click();
});
