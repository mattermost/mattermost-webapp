// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export function clickCategoryMenuItem(categoryDisplayName, menuItemText) {
    cy.contains('.SidebarChannelGroupHeader', categoryDisplayName, {matchCase: false}).should('be.visible').within(() => {
        cy.get('.SidebarMenu').invoke('show').get('.SidebarMenu_menuButton').should('be.visible').click({force: true});
        cy.findByText(menuItemText).click();
    });
}
