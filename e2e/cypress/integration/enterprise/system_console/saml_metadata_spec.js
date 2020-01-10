// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/**
 * Note: This test requires Enterprise license to be uploaded
 */
const testSamlMetadataUrl = 'http://testsamlmetadataurl';
const getSamlMetadataErrorMessage = 'SAML Metadata URL did not connect and pull data successfully';

let config;

describe('SystemConsole->SAML 2.0 - Get Metadata from Idp Flow', () => {
    before(() => {
        cy.apiUpdateConfig({SamlSettings: {Enable: true, IdpMetadataUrl: ''}});
        cy.apiGetConfig().then((response) => {
            config = response.body;
        });

        // # Login as "sysadmin"
        cy.apiLogin('sysadmin');

        //make sure we can navigate to SAML settings
        cy.visit('/admin_console/authentication/saml');
        cy.get('.admin-console__header').should('be.visible').and('have.text', 'SAML 2.0');
    });

    afterEach(() => {
        // # Reload current page after each test
        cy.reload();
    });

    it('fail to fetch metadata from Idp Metadata Url', () => {
        //verify that the metadata Url textbox is enabled and empty
        cy.findByTestId('SamlSettings.IdpMetadataUrlinput').
            scrollIntoView().should('be.visible').and('be.enabled').and('have.text', '');

        //verify that the Get Metadata Url fetch button is disabled
        cy.get('#getSamlMetadataFromIDPButton').find('button').should('be.visible').and('be.disabled');

        //type in the metadata Url in the metadata Url textbox
        cy.findByTestId('SamlSettings.IdpMetadataUrlinput').
            scrollIntoView().should('be.visible').
            focus().type(testSamlMetadataUrl + '{enter}', {force: true});

        //verify that we get the right error message
        cy.get('#getSamlMetadataFromIDPButton').should('be.visible').contains(getSamlMetadataErrorMessage);

        //verify that the IdpUrl textbox content has not been updated
        cy.findByTestId('SamlSettings.IdpUrlinput').then((elem) => {
            Cypress.$(elem).val() === config.SamlSettings.IdpUrl;
        });

        //verify that the IdpUrl textbox content has not been updated
        cy.findByTestId('SamlSettings.IdpDescriptorUrl').then((elem) => {
            Cypress.$(elem).val() === config.SamlSettings.IdpDescriptorUrl;
        });

        //verify that we can succezsfully save the settings (we have not affected previous state)
        cy.get('#saveSetting').click();
    });
});
