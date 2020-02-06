// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import users from '../../../fixtures/saml_users.json';

context('Okta', () => {
    const loginButtonText = 'SAML';

    const regular1 = users.regulars['samluser-1'];
    const admin1 = users.admins['samladmin-1'];
    const guest1 = users.guests['samlguest-1'];

    const newConfig = {
        ServiceSettings: {
            SiteURL: Cypress.config('baseUrl'),
        },
        SamlSettings: {
            Enable: true,
            EnableSyncWithLdap: false,
            EnableSyncWithLdapIncludeAuth: false,
            Verify: true,
            Encrypt: true,
            SignRequest: true,
            IdpUrl: Cypress.env('oktaBaseUrl') + '/app/' + Cypress.env('oktaMMAppName') + '/' + Cypress.env('oktaMMAppId') + '/sso/saml',
            IdpDescriptorUrl: Cypress.env('oktaRootUrl') + '/' + Cypress.env('oktaMMAppId'),
            IdpMetadataUrl: Cypress.env('oktaBaseUrl') + '/app/' + Cypress.env('oktaMMAppId') + '/sso/saml/metadata',
            AssertionConsumerServiceURL: Cypress.config('baseUrl') + '/login/sso/saml',
            SignatureAlgorithm: 'RSAwithSHA1',
            CanonicalAlgorithm: 'Canonical1.0',
            IdpCertificateFile: 'saml-idp.crt',
            PublicCertificateFile: 'saml-public.crt',
            PrivateKeyFile: 'saml-private.key',
            IdAttribute: '',
            GuestAttribute: 'UserType=Guest',
            EnableAdminAttribute: true,
            AdminAttribute: 'UserType=Admin',
            FirstNameAttribute: '',
            LastNameAttribute: '',
            EmailAttribute: 'Email',
            UsernameAttribute: 'Username',
            LoginButtonText: 'SAML',
        },
        ExperimentalSettings: {
            UseNewSAMLLibrary: true
        },
        GuestAccountsSettings: {
            Enable: true
        },
    };

    let testSettings;

    describe('SAML Login flow', () => {
        //assumes that the SAML certificates are already present in the config folder
        before(() => {
            cy.oktaAddUsers(users);
            cy.apiUpdateConfig(newConfig).then(() => {
                cy.apiGetConfig().then((response) => {
                    cy.setTestSettings(loginButtonText, response.body).then((_response) => {
                        testSettings = _response;
                    });
                });
            });
        });

        it('Saml login new MM regular user', () => {
            testSettings.user = regular1;

            cy.oktaGetOrCreateUser(testSettings.user).then((oktaUserId) => {
                cy.oktaDeleteSession(oktaUserId);
                cy.doSamlLogin(testSettings).then(() => {
                    cy.doOktaLogin(testSettings.user).then(() => {
                        cy.skipOrCreateTeam(testSettings, oktaUserId).then(() => {
                            cy.doSamlLogout(testSettings).then(() => {
                                cy.oktaDeleteSession(oktaUserId);
                            });
                        });
                    });
                });
            });
        });

        //assumes that the user 'regular1' successfully logged-in into MM, he is a MM user
        it('Saml login existing MM regular user', () => {
            testSettings.user = regular1;

            cy.oktaGetOrCreateUser(testSettings.user).then((oktaUserId) => {
                cy.oktaDeleteSession(oktaUserId);
                cy.doSamlLogin(testSettings).then(() => {
                    cy.doOktaLogin(testSettings.user).then(() => {
                        cy.doSamlLogout(testSettings).then(() => {
                            cy.oktaDeleteSession(oktaUserId);
                        });
                    });
                });
            });
        });

        it('Saml login new MM guest user', () => {
            testSettings.user = guest1;

            cy.oktaGetOrCreateUser(testSettings.user).then((oktaUserId) => {
                cy.oktaDeleteSession(oktaUserId);
                cy.doSamlLogin(testSettings).then(() => {
                    cy.doOktaLogin(testSettings.user).then(() => {
                        cy.skipOrCreateTeam(testSettings, oktaUserId).then(() => {
                            cy.doSamlLogoutFromSignUp().then(() => {
                                cy.oktaDeleteSession(oktaUserId);
                            });
                        });
                    });
                });
            });
        });

        //assumes that the user 'guest1' successfully logged-in into MM, he is a MM user
        it('Saml login existing MM guest user', () => {
            testSettings.user = guest1;

            cy.oktaGetOrCreateUser(testSettings.user).then((oktaUserId) => {
                cy.oktaDeleteSession(oktaUserId);
                cy.doSamlLogin(testSettings).then(() => {
                    cy.doOktaLogin(testSettings.user).then(() => {
                        cy.doSamlLogoutFromSignUp().then(() => {
                            cy.oktaDeleteSession(oktaUserId);
                        });
                    });
                });
            });
        });

        it('Saml login new MM admin', () => {
            testSettings.user = admin1;

            cy.oktaGetOrCreateUser(testSettings.user).then((oktaUserId) => {
                cy.oktaDeleteSession(oktaUserId);
                cy.doSamlLogin(testSettings).then(() => {
                    cy.doOktaLogin(testSettings.user).then(() => {
                        cy.skipOrCreateTeam(testSettings, oktaUserId).then(() => {
                            cy.doSamlLogout(testSettings).then(() => {
                                cy.oktaDeleteSession(oktaUserId);
                            });
                        });
                    });
                });
            });
        });

        //assumes that the user 'admin1' successfully logged-in into MM, he is a MM user
        it('Saml login existing MM admin', () => {
            testSettings.user = admin1;

            cy.oktaGetOrCreateUser(testSettings.user).then((oktaUserId) => {
                cy.oktaDeleteSession(oktaUserId);
                cy.doSamlLogin(testSettings).then(() => {
                    cy.doOktaLogin(testSettings.user).then(() => {
                        cy.doSamlLogout(testSettings).then(() => {
                            cy.oktaDeleteSession(oktaUserId);
                        });
                    });
                });
            });
        });

        it('Saml login invited Guest user to a closed channel', () => {
            testSettings.user = regular1;

            //login as a regular user - generate an invite link
            cy.oktaGetOrCreateUser(testSettings.user).then((oktaUserId) => {
                cy.oktaDeleteSession(oktaUserId);
                cy.doSamlLogin(testSettings).then(() => {
                    cy.doOktaLogin(testSettings.user).then(() => {
                        cy.skipOrCreateTeam(testSettings, oktaUserId).then(() => {
                            //get invite link
                            cy.getInvitePeopleLink(testSettings).then((inviteUrl) => {
                                //logout regular1
                                cy.oktaDeleteSession(oktaUserId);
                                cy.doSamlLogout(testSettings).then(() => {
                                    testSettings.user = guest1;
                                    cy.oktaGetOrCreateUser(testSettings.user).then((_oktaUserId) => {
                                        cy.visit(inviteUrl).then(() => {
                                            cy.oktaDeleteSession(_oktaUserId);

                                            //login the guest
                                            cy.doSamlLogin(testSettings).then(() => {
                                                cy.doOktaLogin(testSettings.user).then(() => {
                                                    cy.doSamlLogoutFromSignUp();
                                                    cy.oktaDeleteSession(_oktaUserId);
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

        after(() => {
            cy.oktaRemoveUsers(users);
        });
    });
});
