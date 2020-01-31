// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import users from '../../../fixtures/saml_users.json';
import user_roles from '../../../fixtures/saml_user_roles.json';


context('Okta', () => {
    const mmLoginButtonText = 'SAML';

    const regular1 = users.regulars['samluser-1'];
    const admin1 = users.admins['samladmin-1'];
    const guest1 = users.guests['samlguest-1'];

    const assertionConsumerServiceURL = Cypress.config('baseUrl') + '/login/sso/saml';
    const configSamlSettings = {
        SamlSettings: {
            Enable: true,
            EnableSyncWithLdap: false,
            EnableSyncWithLdapIncludeAuth: false,
            Verify: true,
            Encrypt: true,
            SignRequest: false,
            IdpUrl: Cypress.env('okta_base_url') + '/app/' + Cypress.env('okta_mm_app_name') + '/' + Cypress.env('okta_mm_app_id') + '/sso/saml',
            IdpDescriptorUrl: Cypress.env('okta_base_url') + '/' + Cypress.env('okta_mm_app_id'),
            IdpMetadataUrl: Cypress.env('okta_base_url') + '/app/' + Cypress.env('okta_mm_app_id') + '/sso/saml/metadata',
            AssertionConsumerServiceURL: assertionConsumerServiceURL,
            SignatureAlgorithm: 'RSAwithSHA1',
            CanonicalAlgorithm: 'Canonical1.0',
            ScopingIDPProviderId: '',
            ScopingIDPName: '',
            IdpCertificateFile: 'saml-idp.crt',
            PublicCertificateFile: 'saml-public.crt',
            PrivateKeyFile: 'saml-private.key',
            IdAttribute: "",
            GuestAttribute: "",
            EnableAdminAttribute: true,
            AdminAttribute: "userType=Admin",
            FirstNameAttribute: "",
            LastNameAttribute: "",
            EmailAttribute: "Email",
            UsernameAttribute: "Username",
            NicknameAttribute: "",
            LocaleAttribute: "",
            PositionAttribute: "",
            LoginButtonText: "SAML",
            LoginButtonColor: "#34a28b",
            LoginButtonBorderColor: "#2389D7",
            LoginButtonTextColor: "#ffffff"
        },
        ExperimentalSettings: {
            UseNewSAMLLibrary: true
        }
    };

    describe('SAML Login flow', () => {
        //assumes that the SAML certificates are already present in the config folder
        before(() => {
            cy.oktaGetApp().then((appSettings) => {
                appSettings.settings.signOn.destination = assertionConsumerServiceURL;
                cy.oktaUpdateAppSettings(appSettings);
            });

            //cy.oktaAddUsers(users);
            cy.apiUpdateConfig(configSamlSettings);
        });

        it('Saml login new MM regular user', () => {
            cy.setUserRole(configSamlSettings, user_roles.regular);

            cy.oktaGetOrCreateUser(regular1).then((userId) => {
                cy.doSamlLogin({buttonText: mmLoginButtonText, siteUrl: ''}).then(() => {
                    cy.doOktaLogin(regular1).then(() => {
                        const teamName = 't' + userId.substring(0, 14);
                        cy.doCreateTeam(teamName).then(() => {
                            cy.get('#channel_view').should('be.visible');
                            cy.doSamlLogout().then(() => {
                                cy.oktaDeleteSession(userId);
                            });
                        });
                    });
                });
            });
        });

        // //assumes that the user 'regular1' successfully logged-in into MM, he is a MM user
        // it('Saml login existing MM regular user', () => {

        //     cy.setUserRole(configSamlSettings, user_roles.regular);

        //     cy.oktaGetOrCreateUser(regular1).then((userId) => {
        //         cy.doSamlLogin({buttonText: mmLoginButtonText, siteUrl: ''}).then(() => {
        //             cy.doOktaLogin(regular1).then(() => {
        //                 cy.get('#channel_view').should('be.visible');
        //                 cy.doSamlLogout().then(() => {
        //                     cy.oktaDeleteSession(userId);
        //                 });
        //             });
        //         });
        //     });
        // });

        // it('Saml login new MM admin', () => {
        //     //set the user as admin in MM

        //     cy.setUserRole(configSamlSettings, user_roles.admin);

        //     cy.oktaGetOrCreateUser(admin1).then((userId) => {
        //         cy.doSamlLogin({buttonText: mmLoginButtonText, siteUrl: ''}).then(() => {
        //             cy.doOktaLogin(admin1).then(() => {
        //                 const teamName = 't' + userId.substring(0, 14);
        //                 cy.doCreateTeam(teamName).then(() => {
        //                     cy.get('#channel_view').should('be.visible');

        //                     //check that he is an admin
        //                     cy.get('#sidebarHeaderDropdownButton').click()..then(() => {
        //                         //check that he is an admin
        //                         cy.get('#systemConsole').should('be.visible')
        //                     });

        //                     cy.doSamlLogout().then(() => {
        //                         cy.oktaDeleteSession(userId);
        //                     });
        //                 });
        //             });
        //         });
        //     });
        // });

        // //assumes that the user 'admin1' successfully logged-in into MM, he is a MM user
        // it('Saml login existing MM admin', () => {
        //     //set the user as admin in MM
        //     cy.setUserRole(configSamlSettings, user_roles.admin);

        //     cy.oktaGetOrCreateUser(admin1).then((userId) => {
        //         cy.doSamlLogin({buttonText: mmLoginButtonText, siteUrl: ''}).then(() => {
        //             cy.doOktaLogin(admin1).then(() => {
        //                 cy.get('#channel_view').should('be.visible');

        //                 //check that he is an admin
        //                 cy.get('#sidebarHeaderDropdownButton').click()..then(() => {
        //                     //check that he is an admin
        //                     cy.get('#systemConsole').should('be.visible')
        //                 });

        //                 cy.doSamlLogout().then(() => {
        //                     cy.oktaDeleteSession(userId);
        //                 });
        //             });
        //         });
        //     });
        // });

        // it('Saml login invited Guest user', () => {
        //     let inviteUrl;

        //     //set the user as guest in MM
        //     cy.setUserRole(configSamlSettings, user_roles.guest);

        //     //login as a regular MM user - generate an invite link
        //     cy.oktaGetOrCreateUser(regular1).then((userId) => {
        //         cy.doSamlLogin({buttonText: mmLoginButtonText, siteUrl: ''}).then(() => {
        //             cy.doOktaLogin(regular1).then(() => {
        //                 const teamName = 't' + userId.substring(0, 14);
        //                 cy.doCreateTeam(teamName).then(() => {
        //                     cy.get('#channel_view').should('be.visible');

        //                     //invite user guest1 to the team
        //                     cy.getInvitePeopleLink().then((response) => {
        //                         inviteUrl = response;
        //                         cy.get('.close-x').should('be.visible').click();
        //                         cy.get('#channel_view').should('be.visible');

        //                         cy.doSamlLogout().then(() => {
        //                             cy.oktaDeleteSession(userId);

        //                             cy.oktaGetOrCreateUser(guest1).then((_userId) => {
        //                                 //next, enter the new Url
        //                                 cy.visit(inviteUrl);

        //                                 //login the guest
        //                                 cy.doSamlLogin({buttonText: mmLoginButtonText, siteUrl: ''}).then(() => {
        //                                     cy.doOktaLogin(guest1).then(() => {
        //                                         cy.get('#channel_view').should('be.visible');
        //                                         cy.doSamlLogout().then(() => {
        //                                             cy.oktaDeleteSession(_userId);
        //                                         });
        //                                     });
        //                                 });
        //                             });
        //                         });
        //                     });
        //                 });
        //             });
        //         });
        //     });
        // });

        after(() => {
            //cy.oktaRemoveUsers(users);
        });
    });
});

