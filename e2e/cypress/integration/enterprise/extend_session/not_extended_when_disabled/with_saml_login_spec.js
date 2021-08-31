// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Requires openldap and keycloak running
// Requires keycloak certificate at fixtures folder
// - copy ./mattermost-server/build/docker/keycloak/keycloak.crt to ./mattermost-webapp/e2e/cypress/fixtures/keycloak.crt
// Requires Cypress' chromeWebSecurity to be false

// Group: @enterprise @not_cloud @extend_session @ldap @saml @keycloak

import testusers from '../../../../fixtures/saml_ldap_users.json';
import {getRandomId} from '../../../../utils';

import {verifyExtendedSession, verifyNotExtendedSession} from './helpers';

describe('Extended Session Length', () => {
    const sessionLengthInDays = 1;
    const baseUrl = Cypress.config('baseUrl');
    const {keycloakBaseUrl, keycloakAppName} = Cypress.env();
    const idpUrl = `${keycloakBaseUrl}/auth/realms/${keycloakAppName}/protocol/saml`;
    const idpDescriptorUrl = `${keycloakBaseUrl}/auth/realms/${keycloakAppName}`;

    const samlConfig = {
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
            EnableSyncWithLdap: true,
            EnableSyncWithLdapIncludeAuth: true,
            IdAttribute: 'username',
        },
        LdapSettings: {
            EnableSync: true,
            BaseDN: 'ou=e2etest,dc=mm,dc=test,dc=com',
        },
    };

    const sessionConfig = {
        ServiceSettings: {
            SessionLengthSSOInDays: sessionLengthInDays,
        },
    };

    let samlUser;
    let testSettings;

    before(() => {
        cy.shouldNotRunOnCloudEdition();
        cy.apiRequireLicenseForFeature('LDAP', 'SAML');

        // * Server database should match with the DB client and config at "cypress.json"
        cy.apiRequireServerDBToMatch();

        cy.apiUpdateConfig(samlConfig).then(({config}) => {
            // # Require keycloak with realm setup
            cy.apiRequireKeycloak();

            // # Upload certificate, overwrite existing
            cy.apiUploadSAMLIDPCert('keycloak.crt');

            // # Reset keycloak user
            const samlTestUser1 = testusers.user1;
            cy.keycloakResetUsers([samlTestUser1]);

            // # Test LDAP connection and add/reset LDAP/SAML test users
            cy.apiLDAPTest();
            cy.resetLDAPUsers();

            cy.apiGetUserByEmail(samlTestUser1.email, false).then(({user}) => {
                cy.apiSaveTutorialStep(user.id, '999');
                samlUser = {...user, password: samlTestUser1.password};

                testSettings = {
                    loginButtonText: 'SAML',
                    siteName: config.TeamSettings.SiteName,
                    siteUrl: config.ServiceSettings.SiteURL,
                    teamName: '',
                    user: samlUser,
                };
            });
        });
    });

    beforeEach(() => {
        cy.apiAdminLogin();
        cy.apiRevokeUserSessions(samlUser.id);
    });

    it('MM-T4047_1 SAML/SSO user session should have extended due to user activity when enabled', () => {
        // # Enable ExtendSessionLengthWithActivity
        sessionConfig.ServiceSettings.ExtendSessionLengthWithActivity = true;
        cy.apiUpdateConfig({...samlConfig, ...sessionConfig});

        verifyExtendedSession(samlUser, sessionLengthInDays, () => doSamlAndKeycloakLogin(testSettings));
    });

    it('MM-T4047_2 SAML/SSO user session should not extend even with user activity when disabled', () => {
        // # Disable ExtendSessionLengthWithActivity
        sessionConfig.ServiceSettings.ExtendSessionLengthWithActivity = false;
        cy.apiUpdateConfig({...samlConfig, ...sessionConfig});

        verifyNotExtendedSession(samlUser, () => doSamlAndKeycloakLogin(testSettings));
    });
});

function doSamlAndKeycloakLogin(testSettings) {
    // # Mattermost user login via SAML
    cy.doSamlLogin(testSettings);

    // # User login to Keycloak
    cy.doKeycloakLogin(testSettings.user);

    // # Create team if no membership
    cy.skipOrCreateTeam(testSettings, getRandomId());
}
