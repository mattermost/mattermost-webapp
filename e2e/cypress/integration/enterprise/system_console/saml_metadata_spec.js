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
const testIdpUrl = 'http://idpurl';
const testIdpDescriptorUrl = 'http://idpdescriptorurl';
const getSamlMetadataErrorMessage = 'SAML Metadata URL did not connect and pull data successfully';

function setSAMLValidState() {
    //set the names of the certs in the config file
    cy.apiUpdateConfig({
        SamlSettings: {
            Enable: true,
            Verify: true,
            Encrypt: true,
            IdpMetadataUrl: '',
            IdpUrl: testIdpUrl,
            IdpDescriptorUrl: testIdpDescriptorUrl,
            IdpCertificateFile: 'saml-idp.crt',
            PublicCertificateFile: 'saml-public.crt',
            PrivateKeyFile: 'saml-private.key',
        },
    });
}

describe('SystemConsole->SAML 2.0 - Get Metadata from Idp Flow', () => {
    before(() => {
        // # Set SAMLSettings to default values
        setSAMLValidState();

        // # Login as "sysadmin" and go to /
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
        cy.get('input[id="SamlSettings.IdpMetadataUrl"]').
            scrollIntoView().should('be.visible').and('be.enabled').and('have.text', '');

        //verify that the Get Metadata Url fetch button is disabled
        cy.get('#getSamlMetadataFromIDPButton').find('button').should('be.visible').and('be.disabled');

        //type in the metadata Url in the metadata Url textbox
        cy.get('input[id="SamlSettings.IdpMetadataUrl"]').
            scrollIntoView().should('be.visible').
            focus().type(testSamlMetadataUrl + '{enter}', {force: true});

        //verify that we get the right error message
        cy.get('#getSamlMetadataFromIDPButton').should('be.visible').contains(getSamlMetadataErrorMessage);

        //verify that the IdpUrl textbox content has not been updated
        cy.get('input[id="SamlSettings.IdpUrl"]').then((elem) => {
            Cypress.$(elem).val() === testIdpUrl;
        });

        //verify that the IdpUrl textbox content has not been updated
        cy.get('input[id="SamlSettings.IdpDescriptorUrl"]').then((elem) => {
            Cypress.$(elem).val() === testIdpDescriptorUrl;
        });

        //verify that we can succezsfully save the settings (we have not affected previous state)
        cy.get('#saveSetting').click();
    });
});
