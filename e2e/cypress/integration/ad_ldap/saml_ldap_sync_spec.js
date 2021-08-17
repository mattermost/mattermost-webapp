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
            Encrypt: false,
            IdpURL: idpUrl,
            IdpDescriptorURL: idpDescriptorUrl,
            ServiceProviderIdentifier: `${baseUrl}/login/sso/saml`,
            AssertionConsumerServiceURL: `${baseUrl}/login/sso/saml`,
            SignatureAlgorithm: 'RSAwithSHA256',
            CanonicalAlgorithm: 'Canonical1.0',
            IdpCertificateFile: 'saml-idp.crt',
            PublicCertificateFile: '',
            IdAttribute: 'username',
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
            testSettings = response;
            cy.keycloakResetUsers(users);

            // # Add/refresh LDAP Test users
            cy.resetLDAPUsers();
        });
    });

    it('MM-T3013_1 - SAML LDAP Sync Off, user attributes pulled from SAML', () => {
        testSettings.user = users[0];

        // # MM Login via SAML
        cy.doSamlLogin(testSettings);

        // # Login to Keycloak
        cy.doKeycloakLogin(testSettings.user);

        // # Create team if no membership
        cy.skipOrCreateTeam(testSettings, getRandomId());

        // * Check the user settings
        cy.verifyAccountNameSettings(testSettings.user.firstname, testSettings.user.lastname);

        // # Run LDAP Sync
        // * Check that it ran successfully
        cy.runLdapSync(admin);

        // Refresh make sure user not logged out.
        cy.reload();

        // * Check the user settings
        cy.verifyAccountNameSettings(testSettings.user.firstname, testSettings.user.lastname);

        // # Logout user
        cy.doSamlLogout(testSettings);
    });

    it('MM-T3013_2 - SAML LDAP Sync On, user attributes pulled from LDAP', () => {
        const testConfig = {
            ...newConfig,
            SamlSettings: {
                ...newConfig.SamlSettings,
                EnableSyncWithLdap: true,
            },
        };
        cy.apiAdminLogin();
        cy.apiUpdateConfig(testConfig);

        testSettings.user = users[0];

        // # MM Login via SAML
        cy.doSamlLogin(testSettings);

        // # Login to Keycloak
        cy.doKeycloakLogin(testSettings.user);

        // # Create team if no membership
        cy.skipOrCreateTeam(testSettings, getRandomId());

        // * Check the user settings
        cy.verifyAccountNameSettings(testSettings.user.firstname, testSettings.user.lastname);

        // # Run LDAP Sync
        // * Check that it ran successfully
        cy.runLdapSync(admin);

        // # Refresh make sure user not logged out.
        cy.reload();

        // * Check the user settings
        cy.verifyAccountNameSettings(testSettings.user.ldapfirstname, testSettings.user.ldaplastname);

        // # Logout user
        cy.doSamlLogout(testSettings);
    });
});
