// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @ldap @saml

import {getAdminAccount} from '../../support/env';
import * as TIMEOUTS from '../../fixtures/timeouts';
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
    const ldapUser = testusers.user2;
    const nonLdapUser = testusers.user4;
    const users = [ldapUser, nonLdapUser];

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

    it('MM-T3664 - SAML User, Not in LDAP', () => {
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

        testSettings.user = nonLdapUser;

        // # MM Login via SAML
        cy.doSamlLogin(testSettings).then(() => {
            // # Login to Keycloak
            cy.doKeycloakLogin(testSettings.user).then(() => {
                // * check for LDAP Error, if new user error expected
                cy.checkForLDAPError().then((found) => {
                    if (found) {
                        // # MM Login via SAML - Login Again to bypass error
                        cy.doSamlLogin(testSettings).then(() => {
                            // # Login to Keycloak
                            cy.doKeycloakLogin(testSettings.user);
                        });
                    }
                }).then(() => {
                    // # Create team if no membership
                    cy.skipOrCreateTeam(testSettings, getRandomId()).then(() => {
                        // # run LDAP Sync
                        // * check that it ran successfully
                        cy.runLdapSync(admin, baseUrl).then(() => {
                            // # Initiate browser activity
                            cy.reload();
                            cy.modifyLDAPUsers('ldap-add-user.ldif');

                            // * Verify the member is logged out and redirected to login page
                            cy.url({timeout: TIMEOUTS.HALF_MIN}).should('include', '/login');
                            cy.get('#login_section', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible');

                            // # MM Login via SAML
                            cy.doSamlLogin(testSettings).then(() => {
                                // # Login to Keycloak
                                cy.doKeycloakLogin(testSettings.user).then(() => {
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
            });
        });
    });

    it('MM-T3665 - Deactivate user in SAML', () => {
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

        testSettings.user = ldapUser;

        // # MM Login via SAML
        cy.doSamlLogin(testSettings).then(() => {
            // # Login to Keycloak
            cy.doKeycloakLogin(testSettings.user).then(() => {
                // # Create team if no membership
                cy.skipOrCreateTeam(testSettings, getRandomId()).then(() => {
                    // # Skip the tutorial
                    cy.doSkipTutorial();
                    cy.keycloakSuspendUser(testSettings.user.keycloakId).then(() => {
                        // refresh make sure not logged out.
                        cy.reload();

                        // # MM Login via SAML
                        cy.doSamlLogin(testSettings).then(() => {
                            cy.doKeycloakLogin(testSettings.user).then(() => {
                                // * verify login failed.
                                cy.verifyKeycloakLoginFailed().then(() => {
                                    // # activate user in keycloak
                                    cy.keycloakUnsuspendUser(testSettings.user.keycloakId).then(() => {
                                        // # login again
                                        cy.findByText('Password').type(testSettings.user.password);
                                        cy.findAllByText('Log In').last().click();

                                        // * check the user settings
                                        cy.verifyAccountNameSettings(testSettings.user.firstname, testSettings.user.lastname);
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
