// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import users from '../../../fixtures/saml_users.json';

import {_} from 'lodash';
const xml2js = require('xml2js')

context('Okta', () => {
    const mmLoginButtonText = "SAML";

    const regular1 = users.regulars['samluser-1'];
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
        let file1 = Cypress.env("config_folder")+ configSamlSettings.SamlSettings.IdpCertificateFile;
        let file2 = Cypress.env("config_folder")+ configSamlSettings.SamlSettings.PublicCertificateFile;
        let file3 = Cypress.env("config_folder")+ configSamlSettings.SamlSettings.PrivateKeyFile;

        before(() => {
            let userId;

            expect(Cypress.config("chromeWebSecurity")).to.eq(false)

            //TODO - step for obtaining the callbackUrl dynamically from the CI(?) - or do we have a step that builds the cypress.env.json by the CI -maybe create some temporary config values?

            cy.oktaGetApp().then(appSettings => {
                appSettings.settings.signOn.destination = assertionConsumerServiceURL;
            });
            cy.apiUpdateConfig(configSamlSettings);

            cy.oktaGetAppMetadata().then(xmlMetadata => {
                var parser = new xml2js.Parser();
                parser.parseString(xmlMetadata, function (err, result) {
                    let jsonMetadata = (JSON.parse(JSON.stringify(result)));
                    const match = _.get(jsonMetadata, ['md:EntityDescriptor', 'md:IDPSSODescriptor', '0', 'md:KeyDescriptor', '0', 'ds:KeyInfo', '0', 'ds:X509Data', '0', 'ds:X509Certificate', '0'], null);
                    expect(match).to.not.be.null;
                    let certificateStr = '-----BEGIN PRIVATE KEY-----\n' + match + '\n-----END PRIVATE KEY-----'
                    //save the certificate to the config folder
                    cy.writeFile(file1, certificateStr);

                    //copy the certs to the config folder
                    cy.fixture('mattermost-x509.crt').then((publicCert) => {
                        cy.writeFile(file2, publicCert);
                    });
                    cy.fixture('mattermost-x509.key').then((publicKey) => {
                        cy.writeFile(file3, publicKey);
                    });
                });
            });

            //push the users to Okta
            Object.values(users.regulars).forEach(_user => {
                cy.oktaGetUser(_user.email).then(uId => {
                    userId = uId;
                    if( userId == null ){
                        cy.oktaCreateUser(_user).then(uId => {
                            userId = uId;
                            //can we do it when creating the user?
                            cy.oktaAssignUserToApplication(userId, _user);
                        });
                    }
                });
            });

            Object.values(users.guests).forEach(_user => {
                cy.oktaGetUser(_user.email).then(uId => {
                    userId = uId;
                    if( userId == null ){
                        cy.oktaCreateUser(_user).then(uId => {
                            userId = uId;
                            cy.oktaAssignUserToApplication(userId, _user);
                        });
                    }
                });
            });

            Object.values(users.admins).forEach(_user => {
                cy.oktaGetUser(_user.email).then(uId => {
                    userId = uId;
                    if( userId == null ){
                        cy.oktaCreateUser(_user).then(uId => {
                            userId = uId;
                            cy.oktaAssignUserToApplication(userId, _user);
                        });
                    }
                });
            });
        });

        it('Saml login new MM regular user', () => {
            let userId;
            let user = regular1;

            //remove existing user from Okta
            cy.oktaGetUser(user.email).then(uId => {
                userId = uId;
                if( userId != null ){
                    //delete the user
                    cy.oktaDeleteSession(userId).then(() => {
                        //do we need to delete the session as well?
                        cy.oktaDeleteUser(userId);
                    });
                }
                //now add to Okta the "new" user
                cy.oktaCreateUser(user).then(uId => {
                    userId = uId;
                    cy.oktaAssignUserToApplication(userId, user);
                });
            });

            //login then logout this user
             cy.doSamlLoginClick({ buttonText: mmLoginButtonText, siteUrl: '', }).then(() => {
                cy.doOktaLogin(user).then(() => {
                    let teamName = 't' + userId.substring(0,14);
                    cy.doCreateTeam(teamName).then(() => {
                        cy.get('#channel_view').should('be.visible');
                        cy.doSamlLogoutClick().then(() => {
                            cy.oktaDeleteSession(userId);
                        });
                    });
                });
            });
        });

        // it('Saml login existing MM regular user', () => {
        //     let userId;
        //     let user = regular1;

        //     cy.oktaGetUser(user.email).then(uId => {
        //         userId = uId;
        //         if( userId == null ){
        //             cy.oktaCreateUser(user).then(uId => {
        //                 userId = uId;
        //                 cy.oktaAssignUserToApplication(userId, user);
        //             });
        //         } else {
        //             //make sure the user is assigned to the app
        //             cy.oktaAssignUserToApplication(userId, user);
        //             //make sure there is no hanging session
        //             cy.oktaDeleteSession(userId);
        //         }
        //     });

        //     cy.doSamlLoginClick({ buttonText: mmLoginButtonText, siteUrl: '', }).then(() => {
        //         cy.get('#channel_view')
        //         cy.doOktaLogin(user).then(() => {
        //             let teamName = 't' + userId.substring(0,14);
        //             cy.doCreateTeam(teamName).then(() => {
        //                 cy.get('#channel_view').should('be.visible');
        //                 cy.doSamlLogoutClick().then(() => {
        //                     cy.oktaDeleteSession(userId);
        //                 });
        //             });
        //         });
        //     });
        // });

        // it('Saml login existing MM admin', () => {
        //     let userId;
        //     let user = admin1;

        //     cy.oktaGetUser(user.email).then(uId => {
        //         userId = uId;
        //         if( userId == null ){
        //             cy.oktaCreateUser(user).then(uId => {
        //                 userId = uId;
        //                 cy.oktaAssignUserToApplication(userId, user);
        //             });
        //         } else {
        //             //we need to make sure the user is assigned to the app
        //             cy.oktaAssignUserToApplication(userId, user);
        //         }
        //     });

        //     cy.doSamlLoginClick({ buttonText: mmLoginButtonText, siteUrl: '', }).then(() => {
        //         cy.doOktaLogin(user).then(() => {
        //             let teamName = 't' + userId.substring(0,14);
        //             cy.doCreateTeam(teamName).then(() => {
        //                 cy.get('#channel_view').should('be.visible');
        //                 cy.samlLogoutClick();
        //                 //remove new random user from Okta
        //                 cy.oktaDeleteUser(userId);
        //                 cy.oktaDeleteSession(userId);
        //             });
        //         });
        //     });
        // });

        after(() => {
            let userId;

            cy.task('cleanupConfigFolder', {files: [file1, file2, file3], platform: Cypress.platform});

            //remove the users from Okta
            Object.values(users.regulars).forEach(_user => {
                cy.oktaGetUser(_user.email).then(uId => {
                    userId = uId;
                    if( userId != null ){
                        cy.oktaDeleteUser(userId);
                    }
                });
            });

            Object.values(users.guests).forEach(_user => {
                cy.oktaGetUser(_user.email).then(uId => {
                    userId = uId;
                    if( userId != null ){
                        cy.oktaDeleteUser(userId);
                    }
                });
            });

            Object.values(users.admins).forEach(_user => {
                cy.oktaGetUser(_user.email).then(uId => {
                    userId = uId;
                    if( userId != null ){
                        cy.oktaDeleteUser(userId);
                    }
                });
            });
        });
    });
});


