// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Customization', () => {
    let origConfig;

    before(() => {
        // Get config
        cy.apiGetConfig().then((response) => {
            const config = response.body;
            origConfig = {
                SupportSettings: {PrivacyPolicyLink: config.SupportSettings.PrivacyPolicyLink},
            };
        });

        // # Login as sysadmin and visit customization system console page
        cy.apiLogin('sysadmin');
        cy.visit('/admin_console/site_config/customization');
    });

    after(() => {
        cy.apiUpdateConfig(origConfig);
    });

    it('SC20330 - Can change Privacy Policy Link setting', () => {
        // * Verify that setting is visible and matches text content
        cy.findByTestId('SupportSettings.PrivacyPolicyLinklabel').scrollIntoView().should('be.visible').and('have.text', 'Privacy Policy Link:');

        // * Verify that help setting is visible and matches text content
        const content = 'The URL for the Privacy link on the login and sign-up pages. If this field is empty, the Privacy link is hidden from users.';
        cy.findByTestId('SupportSettings.PrivacyPolicyLinkhelp-text').scrollIntoView().find('span').should('be.visible').and('have.text', content);

        // * Verify the input box visible and has default value
        cy.findByTestId('SupportSettings.PrivacyPolicyLinkinput').scrollIntoView().should('have.value', origConfig.SupportSettings.PrivacyPolicyLink).and('be.visible');

        // # Fill input field with value
        const stringToSave = 'https://some.com';
        cy.findByTestId('SupportSettings.PrivacyPolicyLinkinput').clear().type(stringToSave);

        cy.get('#saveSetting').click();

        // * Verify that the value is save, directly via REST API
        cy.apiGetConfig().then((response) => {
            expect(response.body.SupportSettings.PrivacyPolicyLink).to.equal(stringToSave);
        });
    });
});
