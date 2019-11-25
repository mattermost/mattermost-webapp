// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Customization', () => {
    let config;

    before(() => {
        // Get config
        cy.apiGetConfig().then((response) => {
            config = response.body;
        });

        // # Login as sysadmin and visit customization system console page
        cy.apiLogin('sysadmin');
        cy.visit('/admin_console/site_config/customization');
    });

    it('SC20330 - Can change Privacy Policy Link setting', () => {
        const contents = ['The URL for the Privacy link on the login and sign-up pages. If this field is empty, the Privacy link is hidden from users.'];

        // * Verify that setting is visible and matches text content
        cy.get('label[for="SupportSettings.PrivacyPolicyLink"]').should('have.text', 'Privacy Policy Link:').and('be.visible');

        // * Verify that help setting is visible and matches text content
        cy.get('label[for="SupportSettings.PrivacyPolicyLink"]').next().find('span').should('be.visible').and('have.text', contents[0]);

        // * Verify the input box visible and has default value
        cy.get('input[id="SupportSettings.PrivacyPolicyLink"]').should('have.value', config.SupportSettings.PrivacyPolicyLink).and('be.visible');

        // # Fill input field with value
        const stringToSave = 'https://some.com';
        cy.get('[id="SupportSettings.PrivacyPolicyLink"]').clear().type(stringToSave);

        cy.get('#saveSetting').click();

        // * Verify that the value is save, directly via REST API
        cy.apiGetConfig().then((response) => {
            expect(response.body.SupportSettings.PrivacyPolicyLink).to.equal(stringToSave);
        });
    });
});
