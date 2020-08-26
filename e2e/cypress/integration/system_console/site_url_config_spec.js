// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage:
// Group: @system_console

describe('Site URL', () => {
    it('MM-T3279 - Don\'t allow clearing site URL in System Console', () => {
        // # Navigate to System Console -> Environment -> Web Server
        cy.visit('/admin_console/environment/web_server');

        // # Note the site URL value
        cy.get("[data-testid='ServiceSettings.SiteURLinput']").invoke('val').then((originalSiteURLValue) => {
            // # Clear the Site URL
            cy.get("[data-testid='ServiceSettings.SiteURLinput']").clear();

            // # Save
            cy.get('#saveSetting').click();
            cy.waitUntil(() => cy.get('#saveSetting').then((el) => {
                return el[0].innerText === 'Save';
            }));

            // * Check that the error message is present
            cy.get('div.error-message').contains('Site URL cannot be cleared.');

            // # Reload the page
            cy.visit('/admin_console/environment/web_server');

            // * Check that the setting is the original value
            cy.get("[data-testid='ServiceSettings.SiteURLinput']").should('have.value', originalSiteURLValue);
        });

    });
});
