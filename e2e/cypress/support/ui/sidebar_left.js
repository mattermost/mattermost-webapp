// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('uiGetLhsSection', (section) => {
    if (section === 'UNREADS') {
        return cy.findByText(section).parent().parent().parent();
    }

    return cy.findAllByRole('button', {name: section}).first().parent().parent().parent();
});

Cypress.Commands.add('uiBrowseOrCreateChannel', (item) => {
    cy.findByRole('button', {name: 'Add Channel Dropdown'}).should('be.visible').click();
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
    cy.get(`#sidebarItem_${channelName}`).find('.SidebarMenu_menuButton').click({force: true});

    return cy.get('.dropdown-menu').should('be.visible');
});
