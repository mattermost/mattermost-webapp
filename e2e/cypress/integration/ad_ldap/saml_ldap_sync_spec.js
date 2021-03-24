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
import testusers from '../../fixtures/saml_ldap_users.json';

// assumes that E20 license is uploaded
// Update config.mk to make sure docker images for openldap and keycloak
//  - assumes openldap docker available on config default http://localhost:389
//  - assumes keycloak docker - uses api to update
// assumes the CYPRESS_* variables are set (CYPRESS_keycloakBaseUrl / CYPRESS_keycloakAppName)
// requires {"chromeWebSecurity": false}
// copy ./mattermost-server/build/docker/keycloak/keycloak.crt -> ./mattermost-webapp/e2e/cypress/fixtures/keycloak.crt
describe('AD / LDAP', () => {
    const admin = getAdminAccount();
    const loginButtonText = 'SAML';
    const users = [testusers.user1];
    const baseUrl = Cypress.config('baseUrl');
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
            ServiceProviderIdentifier: `${baseUrl}/login/sso/saml`,
            AssertionConsumerServiceURL: `${baseUrl}/login/sso/saml`,
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

        // # Upload certificate, overwrite existing
        cy.apiUploadSAMLIDPCert('keycloak.crt');

        // # Update Configs
        cy.apiUpdateConfig(newConfig).then(({config}) => {
            cy.setTestSettings(loginButtonText, config).then((_response) => {
                testSettings = _response;
                cy.keycloakResetUsers(users);
            });
        });

        // # Add/refresh LDAP Test users
        cy.resetLDAPUsers();
    });

    it('MM-T3013_1 - SAML LDAP Sync Off, user attributes pulled from SAML', () => {
        testSettings.user = users[0];

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

    it('MM-T3013_2 - SAML LDAP Sync On, user attributes pulled from LDAP', () => {
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

        testSettings.user = users[0];

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
