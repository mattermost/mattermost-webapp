// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @ldap @saml @keycloak

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
    const {user3: samlUser3} = testusers;

    const {
        keycloakBaseUrl,
        keycloakAppName,
    } = Cypress.env();

    const idpUrl = `${keycloakBaseUrl}/auth/realms/${keycloakAppName}/protocol/saml`;
    const idpDescriptorUrl = `${keycloakBaseUrl}/auth/realms/${keycloakAppName}`;

    const newConfig = {
        SamlSettings: {
            Enable: true,
            Encrypt: false,
            IdpURL: idpUrl,
            IdpDescriptorURL: idpDescriptorUrl,
            ServiceProviderIdentifier: `${baseUrl}/login/sso/saml`,
            AssertionConsumerServiceURL: `${baseUrl}/login/sso/saml`,
            SignatureAlgorithm: 'RSAwithSHA256',
            PublicCertificateFile: '',
            PrivateKeyFile: '',
            FirstNameAttribute: 'firstName',
            LastNameAttribute: 'lastName',
            EmailAttribute: 'email',
            UsernameAttribute: 'username',
            LoginButtonText: loginButtonText,
            EnableSyncWithLdap: true,
            EnableSyncWithLdapIncludeAuth: true,
            IdAttribute: 'username',
        },
        LdapSettings: {
            EnableSync: true,
            BaseDN: 'ou=e2etest,dc=mm,dc=test,dc=com',
        },
    };

    let testSettings;

    before(() => {
        // * Check if server has license for LDAP and SAML
        cy.apiRequireLicenseForFeature('LDAP', 'SAML');

        // # Require Keycloak with realm setup
        cy.apiRequireKeycloak();

        // # Upload certificate, overwrite existing
        cy.apiUploadSAMLIDPCert('keycloak.crt');

        // # Update Configs
        cy.apiUpdateConfig(newConfig).then(({config}) => {
            return cy.setTestSettings(loginButtonText, config);
        }).then((response) => {
            testSettings = {...response, user: samlUser3};
            return cy.keycloakResetUsers([samlUser3]);
        }).then(() => {
            return cy.apiGetUserByEmail(testSettings.user.email, false);
        }).then(({user}) => {
            // # Reset Mattermost user if exists
            if (user && user.username && user.username !== testSettings.user.username) {
                cy.keycloakUpdateUser(testSettings.user.keycloakId, {username: testSettings.user.username});
            }

            if (user && user.id) {
                cy.apiUpdateUserAuth(user.id, testSettings.user.username, '', 'saml');
            }

            // # Add/refresh LDAP Test users
            cy.resetLDAPUsers();
        });
    });

    it('MM-T3666 - SAML / LDAP sync with ID Attribute', () => {
        // # MM Login via SAML
        cy.doSamlLogin(testSettings);

        // # Login to Keycloak
        cy.doKeycloakLogin(testSettings.user);

        // # Create team if no membership
        cy.skipOrCreateTeam(testSettings, getRandomId());

        // # Skip the tutorial
        cy.doSkipTutorial();

        // # Run LDAP Sync
        // * Check that it ran successfully
        cy.runLdapSync(admin, baseUrl);

        // # User is not logged out, log out now
        cy.doLDAPLogout(testSettings);

        // * Verify if the regular member is logged out and redirected to login page
        cy.doSamlLogin(testSettings);

        // # Login to Keycloak
        cy.doKeycloakLogin(testSettings.user);

        // * Verify an error is received.
        cy.findByText('An account with that email already exists.');

        // # Back to login again
        cy.findByText('Back to Mattermost').should('be.visible').click();

        // # Update username in keycloak for successful login
        cy.keycloakUpdateUser(testSettings.user.keycloakId, {username: 'e2etest.three.ldap'});

        // # Login again
        cy.doSamlLogin(testSettings);
        cy.doKeycloakLogin(testSettings.user);
        cy.doSkipTutorial();

        // * Check the user settings
        cy.verifyAccountNameSettings(testSettings.user.firstname, testSettings.user.lastname);
        cy.runLdapSync(admin, baseUrl);

        // # Initiate browser activity like visit on test channel
        cy.reload();

        // * Check the user settings
        cy.verifyAccountNameSettings(testSettings.user.ldapfirstname, testSettings.user.ldaplastname);
    });
});
