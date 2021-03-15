// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
export function openCustomStatusModal() {
    // # Open status menu
    cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

    // # Click the "Set a Custom Status" header
    cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu li#status-menu-custom-status').click();
    cy.get('#custom_status_modal').should('exist');
}
