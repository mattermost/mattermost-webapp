// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Customization', () => {
    before(() => {
        // # Login as sysadmin and visit customization system console page
        cy.apiLogin('sysadmin');
        cy.visit('/admin_console/site_config/customization');
    });

    it('SC20336 - Can change Custom Brand Image setting', () => {
        // # Set Enable Custom Branding to true to be able to upload custom brand image
        cy.get('[id="TeamSettings.EnableCustomBrandtrue"]').check();

        cy.findByTestId('CustomBrandImage').should('be.visible').within(() => {
            // * Verify that setting is visible and matches text content
            cy.get('label').should('be.visible').and('have.text', 'Custom Brand Image:');

            // * Verify that help setting is visible and matches text content
            const contents = 'Customize your user experience by adding a custom image to your login screen. Recommended maximum image size is less than 2 MB.';
            cy.get('.help-text').should('be.visible').and('have.text', contents);

            // # upload the image
            cy.fileUpload('input');
        });

        // # save image
        cy.get('#saveSetting').click();

        // # Verify that after page reload image exist
        cy.reload();
        cy.findByTestId('CustomBrandImage').should('be.visible').within(() => {
            cy.get('img').should('have.attr', 'src').and('include', '/api/v4/brand/image?t=');
        });
    });
});
