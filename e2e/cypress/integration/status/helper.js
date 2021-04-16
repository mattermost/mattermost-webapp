// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
export function openDNDTimeSelectionModal() {
    // # Open status menu
    cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

    // # Click the "Do Not Disturb" menu item
    cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu li#status-menu-dnd').click();
    cy.get('.SubMenuItemContainer li#dndTime-5-Custom_menuitem #dndTime-5-Custom').click();
    cy.get('#dndCustomTimePickerModal').should('exist');
}
