// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../fixtures/timeouts';

export function clickCategoryMenuItem(categoryDisplayName, menuItemText) {
    cy.contains('.SidebarChannelGroupHeader', categoryDisplayName, {matchCase: false}).should('be.visible').within(() => {
        cy.get('.SidebarMenu').invoke('show').get('.SidebarMenu_menuButton').should('be.visible').click({force: true});
        cy.findByRole('menu').findByText(menuItemText).should('be.visible').click();
        cy.wait(TIMEOUTS.HALF_SEC);
    });
}
