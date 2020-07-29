const OKTA_EMAIL = 'hosstheboss@mattermost.com';
const LDAP_EMAIL = 'Test.Two';
const LDAP_PASSWORD = 'Password1';
const OKTA_PASSWORD = 'Test123456';
const OKTA_USER = {
    username: OKTA_EMAIL,
    password: OKTA_PASSWORD,
    firstname: "HosseinFirst",
    lastname: "HosseinLast",
};

let testSettings;
const loginButtonText = 'SAML';

// ASSUMPTION: SAML AND LDAP already successfully setup!
describe('SAML Test', () => {

    it('Test # 1 - Check SAML Metadata without Enable Encryption', () => {
        const newConfig = {
            SamlSettings: {
                EnableSyncWithLdap: false,
            },
            LdapSettings: {
                EnableSync: false
            }
        };
        cy.apiUpdateConfig(newConfig).then(({config}) => {
            cy.setTestSettings(loginButtonText, config).then((_response) => {
                testSettings = _response;
                cy.doSamlLogin(testSettings);
            });
        });
        // cy.doOktaLogin({
        //     username: OKTA_EMAIL,
        //     password: OKTA_PASSWORD
        // })
        // cy.apiAdminLogin();
    });

});
