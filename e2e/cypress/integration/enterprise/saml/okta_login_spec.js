// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. #. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../../fixtures/saml_users.json';

//Manual Setup required: Follow the instructions mentioned in the mattermost/platform-private/config/saml-okta-setup.txt file
context('Okta', () => {
    const loginButtonText = 'SAML';

    const regular1 = users.regulars['samluser-1'];
    const guest1 = users.guests['samlguest-1'];
    const guest2 = users.guests['samlguest-2'];
    const admin1 = users.admins['samladmin-1'];
    const admin2 = users.admins['samladmin-2'];

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
            IdpUrl: Cypress.env('oktaBaseUrl') + '/app/' + Cypress.env('oktaMMAppName') + '/' + Cypress.env('oktaMMEntityId') + '/sso/saml',
            IdpDescriptorUrl: 'http://www.okta.com/' + Cypress.env('oktaMMEntityId'),
            IdpMetadataUrl: Cypress.env('oktaBaseUrl') + '/app/' + Cypress.env('oktaMMEntityId') + '/sso/saml/metadata',
            AssertionConsumerServiceURL: Cypress.config('baseUrl') + '/login/sso/saml',
            SignatureAlgorithm: 'RSAwithSHA1',
            CanonicalAlgorithm: 'Canonical1.0',
            IdpCertificateFile: 'saml-idp.crt',
            PublicCertificateFile: 'saml-public.crt',
            PrivateKeyFile: 'saml-private.key',
            IdAttribute: '',
            GuestAttribute: '',
            EnableAdminAttribute: false,
            AdminAttribute: '',
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

    //Note: the assumption is that this test suite runs on a clean setup (empty DB) which would ensure that the users are not present in the Mattermost instance beforehand
    describe('SAML Login flow', () => {
        before(() => {
            // * Check if server has license for SAML
            cy.requireLicenseForFeature('SAML');

            cy.oktaAddUsers(users);
            cy.apiUpdateConfig(newConfig).then(() => {
                cy.apiGetConfig().then((response) => {
                    cy.setTestSettings(loginButtonText, response.body).then((_response) => {
                        testSettings = _response;
                    });
                });
            });
        });

        it('Saml login new and existing MM regular user', () => {
            testSettings.user = regular1;

            //login new user
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

            //login existing user
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

        it('Saml login new and existing MM guest user(userType=Guest)', () => {
            testSettings.user = guest1;
            newConfig.SamlSettings.GuestAttribute = 'UserType=Guest';

            cy.apiUpdateConfig(newConfig).then(() => {
                //login new user
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

                //login existing user
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
        });

        it('Saml login new and existing MM guest(isGuest=true)', () => {
            testSettings.user = guest2;
            newConfig.SamlSettings.GuestAttribute = 'IsGuest=true';

            cy.apiUpdateConfig(newConfig).then(() => {
                //login new user
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

                //login existing user
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
        });

        it('Saml login new and existing MM admin(userType=Admin)', () => {
            testSettings.user = admin1;
            newConfig.SamlSettings.EnableAdminAttribute = true;
            newConfig.SamlSettings.AdminAttribute = 'UserType=Admin';

            cy.apiUpdateConfig(newConfig).then(() => {
                //login new user
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

                //login existing user
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
        });

        it('Saml login new and existing MM admin(isAdmin=true)', () => {
            testSettings.user = admin2;
            newConfig.SamlSettings.EnableAdminAttribute = true;
            newConfig.SamlSettings.AdminAttribute = 'IsAdmin=true';

            cy.apiUpdateConfig(newConfig).then(() => {
                //login new user
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
        });

        it('Saml login invited Guest user to a team', () => {
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
    });
});
