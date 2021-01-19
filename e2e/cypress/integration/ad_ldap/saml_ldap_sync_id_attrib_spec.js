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
    const baseUrl = Cypress.config('baseUrl');
    const loginButtonText = 'SAML';
    const users = [testusers.user3];

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

    it('MM-T3666 - SAML / LDAP sync with ID Attribute', () => {
        const testConfig = {
            ...newConfig,
            SamlSettings: {
                ...newConfig.SamlSettings,
                EnableSyncWithLdap: true,
                EnableSyncWithLdapIncludeAuth: true,
                IdAttribute: 'username',
            },
        };
        cy.apiAdminLogin().then(() => {
            cy.apiUpdateConfig(testConfig);
        });

        testSettings.user = users[0];

        // # Reset Mattermost user if exists
        cy.apiGetUserByEmail(testSettings.user.email, false).then(({user}) => {
            if (user && user.username && user.username !== testSettings.user.username) {
                cy.apiPatchUser(user.id, {username: testSettings.user.username}).then(() => {
                    cy.apiUpdateUserAuth(user.id, testSettings.user.username, '', 'saml');
                });
            }
        }).then(() => {
            // # MM Login via SAML
            cy.doSamlLogin(testSettings).then(() => {
                // # Login to Keycloak
                cy.doKeycloakLogin(testSettings.user).then(() => {
                    // # Create team if no membership
                    cy.skipOrCreateTeam(testSettings, getRandomId()).then(() => {
                        // # Skip the tutorial
                        cy.doSkipTutorial();

                        // # run LDAP Sync
                        // * check that it ran successfully
                        cy.runLdapSync(admin, baseUrl).then(() => {
                            // # User is not logged out, log out now
                            cy.doLDAPLogout(testSettings);

                            // * Verify if the regular member is logged out and redirected to login page
                            cy.doSamlLogin(testSettings).then(() => {
                                // # Login to Keycloak
                                cy.doKeycloakLogin(testSettings.user).then(() => {
                                    // * Verify an error is received.
                                    cy.findByText('An account with that email already exists.');

                                    // # Back to login again
                                    cy.findByText('Back to Mattermost').should('exist').and('be.visible').click();

                                    // # update username in keycloak for successful login
                                    cy.keycloakUpdateUser(testSettings.user.keycloakId, {username: 'e2etest.three.ldap'}).then(() => {
                                        cy.doSamlLogin(testSettings).then(() => {
                                            cy.doKeycloakLogin(testSettings.user).then(() => {
                                                cy.doSkipTutorial();

                                                // * check the user settings
                                                cy.verifyAccountNameSettings(testSettings.user.firstname, testSettings.user.lastname);
                                                cy.runLdapSync(admin, baseUrl).then(() => {
                                                    // # Initiate browser activity like visit on test channel
                                                    cy.reload();

                                                    // * check the user settings
                                                    cy.verifyAccountNameSettings(testSettings.user.ldapfirstname, testSettings.user.ldaplastname);
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
