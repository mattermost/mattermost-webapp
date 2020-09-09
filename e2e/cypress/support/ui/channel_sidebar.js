// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getRandomId} from '../../utils';

Cypress.Commands.add('uiCreateSidebarCategory', (categoryName = `category-${getRandomId()}`) => {
    // # Click the New Category/Channel Dropdown button
    cy.get('.AddChannelDropdown_dropdownButton').click();

    // # Click the Create New Category dropdown item
    cy.get('.AddChannelDropdown').contains('.MenuItem', 'Create New Category').click();

    // # Fill in the category name and click Create
    cy.get('input[placeholder="Name your category"]').type(categoryName);
    cy.contains('button', 'Create').click();

    // * Wait for the category to appear in the sidebar
    return cy.contains('.SidebarChannelGroup', categoryName, {matchCase: false});
});

Cypress.Commands.add('uiMoveChannelToCategory', (channelName, categoryName = `category-${getRandomId()}`, newCategory = false) => {
    // Open the channel menu, select Move to, and click either New Category or on the category
    cy.get(`#sidebarItem_${channelName}`).find('.SidebarMenu_menuButton').click({force: true});
    cy.get('.SidebarMenu').contains('.SubMenuItem', 'Move to').
        contains(newCategory ? 'New Category' : categoryName, {matchCase: false}).
        click({force: true});

    if (newCategory) {
        // # Fill in the category name and click Create
        cy.get('input[placeholder="Name your category"]').type(categoryName);
        cy.contains('button', 'Create').click();
    }

    // * Wait for the channel to appear in the category
    cy.contains('.SidebarChannelGroup', categoryName, {matchCase: false}).
        find(`#sidebarItem_${channelName}`).should('exist');

    return cy.contains('.SidebarChannelGroup', categoryName, {matchCase: false});
});
