// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @ldap @saml

import {getAdminAccount} from '../../support/env';
import {getRandomId} from '../../utils';

// assumes that E20 license is uploaded
// assumes openldap docker available on config default http://localhost:389
// assumes keycloak docker - uses api to update
// assumes the CYPRESS_* variables are set (CYPRESS_keycloakBaseUrl / CYPRESS_keycloakAppName)
// requires {"chromeWebSecurity": false}
// copy ./mattermost-server/build/docker/keycloak/keycloak.crt -> ./mattermost-server/config/saml-idp.crt
describe('ad_ldap', () => {
    const admin = getAdminAccount();
    const loginButtonText = 'SAML';

    const user1 = {
        username: 'e2etest.one',
        password: 'Password1',
        email: 'e2etest.one@mmtest.com',
        firstname: 'TestSaml',
        lastname: 'OneSaml',
        ldapfirstname: 'TestLDAP',
        ldaplastname: 'OneLDAP',
        userType: '',
        keycloakId: '',
    };

    const users = {user1};
    const {
        keycloakBaseUrl,
        keycloakAppName,
    } = Cypress.env();

    const idpUrl = `${keycloakBaseUrl}/auth/realms/${keycloakAppName}/protocol/saml`;
    const idpDescriptorUrl = `${keycloakBaseUrl}/auth/realms/${keycloakAppName}`;

    const newConfig = {
        SamlSettings: {
            Enable: true,
            EnableSyncWithLdap: false,
            EnableSyncWithLdapIncludeAuth: false,
            Verify: true,
            Encrypt: false,
            SignRequest: false,
            IdpUrl: idpUrl,
            IdpDescriptorUrl: idpDescriptorUrl,
            IdpMetadataUrl: '',
            ServiceProviderIdentifier: `${Cypress.config('baseUrl')}/login/sso/saml`,
            AssertionConsumerServiceURL: `${Cypress.config('baseUrl')}/login/sso/saml`,
            SignatureAlgorithm: 'RSAwithSHA256',
            CanonicalAlgorithm: 'Canonical1.0',
            IdpCertificateFile: 'saml-idp.crt',
            PublicCertificateFile: '',
            PrivateKeyFile: '',
            IdAttribute: 'username',
            GuestAttribute: '',
            EnableAdminAttribute: false,
            AdminAttribute: '',
            FirstNameAttribute: 'firstName',
            LastNameAttribute: 'lastName',
            EmailAttribute: 'email',
            UsernameAttribute: 'username',
            LoginButtonText: loginButtonText,
        },
        LdapSettings: {
            EnableSync: true,
            BaseDN: 'ou=e2etest,dc=mm,dc=test,dc=com',
        },
    };

    let testSettings;

    before(() => {
        // * Check if server has license for SAML
        cy.apiRequireLicenseForFeature('SAML');

        // * Check if server has license for LDAP
        cy.apiRequireLicenseForFeature('LDAP');

        // # Get certificates status and upload as necessary
        cy.apiGetSAMLCertificateStatus().then((resp) => {
            const data = resp.body;

            if (!data.idp_certificate_file) {
                cy.apiUploadSAMLIDPCert('saml-idp.crt');
            }
        });

        // # Update Configs
        cy.apiUpdateConfig(newConfig).then(({config}) => {
            cy.setTestSettings(loginButtonText, config).then((_response) => {
                testSettings = _response;
                cy.keycloakResetUsers(users);
            });
        });

        // # Add/refresh LDAP Test users
        cy.addLDAPUsers();
    });

    it('MM-T3013 (Step 1) - SAML LDAP Sync Off,  user attributes pulled from SAML', () => {
        testSettings.user = user1;

        // # MM Login via SAML
        cy.doSamlLogin(testSettings).then(() => {
            // # Login to Keycloak
            cy.doKeycloakLogin(testSettings.user).then(() => {
                // # Create team if no membership
                cy.skipOrCreateTeam(testSettings, getRandomId()).then(() => {
                    // * check the user settings
                    cy.verifyAccountNameSettings(testSettings.user.firstname, testSettings.user.lastname);

                    // # run LDAP Sync
                    // * check that it ran successfully
                    cy.runLdapSync(admin).then(() => {
                        // refresh make sure user not logged out.
                        cy.reload();

                        // * check the user settings
                        cy.verifyAccountNameSettings(testSettings.user.firstname, testSettings.user.lastname);

                        // # logout user
                        cy.doSamlLogout(testSettings);
                    });
                });
            });
        });
    });

    it('MM-T3013 (Step 1) - SAML LDAP Sync On - user attributes pulled from LDAP', () => {
        const testConfig = {
            ...newConfig,
            SamlSettings: {
                ...newConfig.SamlSettings,
                EnableSyncWithLdap: true,
            },
        };
        cy.apiAdminLogin().then(() => {
            cy.apiUpdateConfig(testConfig);
        });

        testSettings.user = user1;

        // # MM Login via SAML
        cy.doSamlLogin(testSettings).then(() => {
            // # Login to Keycloak
            cy.doKeycloakLogin(testSettings.user).then(() => {
                // # Create team if no membership
                cy.skipOrCreateTeam(testSettings, getRandomId()).then(() => {
                    // * check the user settings
                    cy.verifyAccountNameSettings(testSettings.user.firstname, testSettings.user.lastname);

                    // # run LDAP Sync
                    // * check that it ran successfully
                    cy.runLdapSync(admin).then(() => {
                        // refresh make sure user not logged out.
                        cy.reload();

                        // * check the user settings
                        cy.verifyAccountNameSettings(testSettings.user.ldapfirstname, testSettings.user.ldaplastname);

                        // # logout user
                        cy.doSamlLogout(testSettings);
                    });
                });
            });
        });
    });
});

