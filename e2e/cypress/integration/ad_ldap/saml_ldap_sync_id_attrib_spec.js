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
    const baseUrl = Cypress.config('baseUrl');
    const loginButtonText = 'SAML';

    const user3 = {
        username: 'e2etest.three.saml',
        password: 'Password1',
        email: 'e2etest.three@mmtest.com',
        firstname: 'FirstSaml',
        lastname: 'ThreeSaml',
        ldapfirstname: 'TestLDAP',
        ldaplastname: 'ThreeLDAP',
        keycloakId: '',
    };
    const users = {user3};

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

    it('MM-T3013 (Step 4) - SAML / LDAP sync with ID Attribute', () => {
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

        testSettings.user = user3;

        // # reset mattermost user if exists
        cy.apiGetUserByEmailNoError(user3.email).then(({user}) => {
            if (user && user.username && user.username !== user3.username) {
                cy.apiPatchUser(user.id, {username: user3.username}).then(() => {
                    cy.apiUpdateAuthData(user.id, {auth_data: user3.username, auth_service: 'saml'});
                });
            }
        }).then(() => {
            // # make sure no keycloak session exists
            cy.keycloakDeleteSession(testSettings.token, testSettings.user.keycloakId).then(() => {
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
                                        cy.keycloakUpdateUserAPI(testSettings.token, testSettings.user.keycloakId, {username: 'e2etest.three.ldap'}).then(() => {
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
});
