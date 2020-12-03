// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @system_console

// # Goes to the System Scheme page as System Admin
const goToAdminConsole = () => {
    cy.apiAdminLogin();
    cy.visit('/admin_console');
};

describe('System console', () => {
    it('MM-T897_2 - System Console menu footer should not cut off at the bottom', () => {
        goToAdminConsole();

        // * Scroll to the last item of the page and ensure it can be clicked
        cy.findByTestId('experimental.bleve').scrollIntoView().click();
    });

    it('MM-T1634 - Search box should remain visible / in the header as you scroll down the settings list in the left-hand-side', () => {
        goToAdminConsole();

        // * Scroll to bottom of left hand side
        cy.findByTestId('experimental.bleve').scrollIntoView().click();

        // * To check if the sidebar is in view, try to click it
        cy.get('#adminSidebarFilter').should('be.visible').click();
    });
});
