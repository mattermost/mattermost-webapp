// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import users from '../../../fixtures/saml_users.json';

context('Okta', () => {
    const mmLoginButtonText = "SAML";

    const regular1 = users.regulars['samluser-1'];
    const regular2 = users.regulars['samluser-2'];
    const regular3 = users.regulars['samluser-3'];

    const admin1 = users.admins['samladmin-1'];
    const guest1 = users.guests['samlguest-1'];

    const assertionConsumerServiceURL = "http://localhost:8065/login/sso/saml"
    let configSamlSettings = {
        SamlSettings: {
            "Enable": true,
            "EnableSyncWithLdap": false,
            "EnableSyncWithLdapIncludeAuth": false,
            "Verify": true,
            "Encrypt": true,
            "SignRequest": false,
            "IdpUrl": Cypress.env("okta_base_url") + "/app/" + Cypress.env("okta_mm_app_name") + "/" + Cypress.env("okta_mm_app_id") + "/sso/saml",
            "IdpDescriptorUrl": Cypress.env("okta_root_url") + "/" + Cypress.env("okta_mm_app_id"),
            "IdpMetadataUrl": Cypress.env("okta_base_url") +  "/app/" + Cypress.env("okta_mm_app_id") + "/sso/saml/metadata",
            "AssertionConsumerServiceURL": assertionConsumerServiceURL,
            "SignatureAlgorithm": "RSAwithSHA1",
            "CanonicalAlgorithm": "Canonical1.0",
            "ScopingIDPProviderId": "",
            "ScopingIDPName": "",
            "IdpCertificateFile": "saml-idp.crt",
            "PublicCertificateFile": "saml-public.crt",
            "PrivateKeyFile": "saml-private.key",
            "IdAttribute": "",
            "GuestAttribute": "",
            "FirstNameAttribute": "",
            "LastNameAttribute": "",
            "EmailAttribute": "Email",
            "UsernameAttribute": "Username",
            "NicknameAttribute": "",
            "LocaleAttribute": "",
            "PositionAttribute": "",
            "LoginButtonText": "SAML",
            "LoginButtonColor": "#34a28b",
            "LoginButtonBorderColor": "#2389D7",
            "LoginButtonTextColor": "#ffffff"
        },
        "ExperimentalSettings": {
            "UseNewSAMLLibrary": true
        }
    };

    describe('SAML Login flow', () => {
        let idpCertFile = Cypress.env("config_folder")+ configSamlSettings.SamlSettings.IdpCertificateFile;
        let publicCertFile = Cypress.env("config_folder")+ configSamlSettings.SamlSettings.PublicCertificateFile;
        let privateKeyFile = Cypress.env("config_folder")+ configSamlSettings.SamlSettings.PrivateKeyFile;

        before(() => {
            expect(Cypress.config("chromeWebSecurity")).to.eq(false)

            //TODO - step for obtaining the callbackUrl dynamically from the CI(?) - or do we have a step that builds the cypress.env.json by the CI -maybe create some temporary config values?

            cy.oktaGetApp().then(appSettings => {
                appSettings.settings.signOn.destination = assertionConsumerServiceURL;
            });

            cy.oktaGetAppCertificate().then(certificateStr => {
                //save the certificates to the config folder
                cy.writeFile(idpCertFile, certificateStr);
                cy.fixture('mattermost-x509.crt').then((publicCert) => {
                    cy.writeFile(publicCertFile, publicCert);
                });
                cy.fixture('mattermost-x509.key').then((publicKey) => {
                    cy.writeFile(privateKeyFile, publicKey);
                });

                cy.oktaAddUsers(users);
                cy.apiUpdateConfig(configSamlSettings);
            });
        });

        it('Saml login new MM regular user', () => {
            cy.oktaGetOrCreateUser(regular1).then((userId) => {
                cy.doSamlLogin({ buttonText: mmLoginButtonText, siteUrl: '', }).then(() => {
                    cy.doOktaLogin(regular1).then(() => {
                        let teamName = 't' + userId.substring(0,14);
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

        //assumes that the user 'regular1' successfully logged-in into MM, he is a MM user
        it('Saml login existing MM regular user', () => {
            cy.oktaGetOrCreateUser(regular1).then((userId) => {
                cy.doSamlLogin({ buttonText: mmLoginButtonText, siteUrl: '', }).then(() => {
                    cy.doOktaLogin(regular1).then(() => {
                        cy.get('#channel_view').should('be.visible');
                        cy.doSamlLogout().then(() => {
                            cy.oktaDeleteSession(userId);
                        });
                    });
                });
            });
        });

        it('Saml login new MM admin', () => {
            cy.oktaGetOrCreateUser(admin1).then((userId) => {
                cy.doSamlLogin({ buttonText: mmLoginButtonText, siteUrl: '', }).then(() => {
                    cy.doOktaLogin(admin1).then(() => {
                        let teamName = 't' + userId.substring(0,14);
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

        //assumes that the user 'admin1' successfully logged-in into MM, he is a MM user
        it('Saml login existing MM admin', () => {
            cy.oktaGetOrCreateUser(admin1).then((userId) => {
                cy.doSamlLogin({ buttonText: mmLoginButtonText, siteUrl: '', }).then(() => {
                    cy.doOktaLogin(admin1).then(() => {
                        cy.get('#channel_view').should('be.visible');
                        cy.doSamlLogout().then(() => {
                            cy.oktaDeleteSession(userId);
                        });
                    });
                });
            });
        });

        it('Saml login invited Guest user', () => {
            let inviteUrl;

            //login as a regular MM user - generate an invite link
            cy.oktaGetOrCreateUser(regular1).then((userId) => {
                cy.doSamlLogin({ buttonText: mmLoginButtonText, siteUrl: '', }).then(() => {
                    cy.doOktaLogin(regular1).then(() => {
                        let teamName = 't' + userId.substring(0,14);
                        cy.doCreateTeam(teamName).then(() => {
                            cy.get('#channel_view').should('be.visible');
                            //invite user guest1 to the team
                            cy.getInvitePeopleLink().then((response) => {
                                inviteUrl = response;
                                cy.get('.close-x').should('be.visible').click();
                                cy.get('#channel_view').should('be.visible');

                                cy.doSamlLogout().then(() => {
                                    cy.oktaDeleteSession(userId);

                                    cy.oktaGetOrCreateUser(guest1).then((userId) => {
                                        //next, enter the new Url
                                        cy.visit(inviteUrl);
                                        //login the guest
                                        cy.doSamlLogin({ buttonText: mmLoginButtonText, siteUrl: '', }).then(() => {
                                            cy.doOktaLogin(guest1).then(() => {
                                                cy.get('#channel_view').should('be.visible');
                                                cy.doSamlLogout().then(() => {
                                                    cy.oktaDeleteSession(userId);
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
            cy.task('cleanupConfigFolder', {files: [idpCertFile, publicCertFile, privateKeyFile], platform: Cypress.platform});
            cy.oktaRemoveUsers(users);
        });
    });
});


