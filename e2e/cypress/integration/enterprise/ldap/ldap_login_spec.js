// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import users from '../../../fixtures/ldap_users.json';
import {getRandomInt} from '../../../utils';

// TODO: UPDATE THIS

// assumes that the SAML certificates+keys are already present in the config folder
// assumes that Cypress.env.json is copied in the same folder with Cypress.json
// assumes thet CYPRESS_* variables are set
// In the Okta Applicaions->Okta MM App define attribute statements:
// Name: UserType -> Value: user.userType
// Name: IsAdmin -> Value: user.isAdmin
// Name: IsGuest -> Value: user.isGuest
// In the Okta Profile Editor, add following custom types:
// - for Okta app: variablename: isAdmin(boolean, isGuest(boolean) (userType is already defined)
// - for Okta MM app: variablename: UserType(string),IsGuest(boolean), IsAdmin(boolean)

/**
 * Note: This test requires Enterprise license to be uploaded
 */
context('ldap', () => {
    const user1 = users['test-1'];
    const guest1 = users['board-1'];
    const guest2 = users['board-2'];
    const admin1 = users['dev-1'];

    // const admin2 = users['dev-2'];
    let testSettings;

    const newConfig = {
        ServiceSettings: {
            SiteURL: Cypress.config('baseUrl'),
        },
        LdapSettings: {
            Enable: true,
            EnableSync: false,
            LdapServer: 'localhost', //Cypress.env('ldapServer'), //localhost
            LdapPort: 389, //Cypress.env('ldapPort'), //389,
            ConnectionSecurity: '',
            BaseDN: 'dc=mm,dc=test,dc=com',
            BindUsername: 'cn=admin,dc=mm,dc=test,dc=com',
            BindPassword: 'mostest',
            UserFilter: '',
            GroupFilter: '',
            GuestFilter: '',
            EnableAdminFilter: false,
            AdminFilter: '',
            GroupDisplayNameAttribute: 'cn',
            GroupIdAttribute: 'entryUUID',
            FirstNameAttribute: 'cn',
            LastNameAttribute: 'sn',
            EmailAttribute: 'mail',
            UsernameAttribute: 'uid',
            NicknameAttribute: 'cn',
            IdAttribute: 'uid',
            PositionAttribute: '',
            LoginIdAttribute: 'uid',
            SyncIntervalMinutes: 60,
            SkipCertificateVerification: false,
            QueryTimeout: 60,
            MaxPageSize: 0,
            LoginFieldName: '',
            LoginButtonColor: '#0000',
            LoginButtonBorderColor: '#2389D7',
            LoginButtonTextColor: '#2389D7',
            Trace: false
        },
        GuestAccountsSettings: {
            Enable: true
        },
    };

    let teamId;
    let randomTeam;
    
    describe('LDAP Login flow - User Filter)', () => {
        before(() => {
            cy.apiUpdateConfig(newConfig).then(() => {
                cy.apiGetConfig().then((response) => {
                    cy.setLDAPTestSettings(response.body).then((_response) => {
                        testSettings = _response;
                    });
                });
            });

            before(() => {
                cy.apiLogin('sysadmin');
                // # Ensure an open team is available to join
                randomTeam = 'T' + String(getRandomInt(10000));
                cy.apiCreateTeam(randomTeam, randomTeam).then((response) => {
                    teamId = response.body.id;
                });
            });    
        });

        it('LDAP Invalid login existing user', () => {
            testSettings.user = user1;
            newConfig.LdapSettings.UserFilter = '(sn=no_users)';
            cy.apiUpdateConfig(newConfig).then(() => {
                cy.doLDAPLogin(testSettings).then(() => {
                    cy.checkLoginFailed(testSettings);
                });
            });
        });

        it('LDAP login new and existing MM regular user', () => {
            testSettings.user = user1;
            newConfig.LdapSettings.UserFilter = '(sn=user)';
            cy.log(newConfig);
            cy.apiUpdateConfig(newConfig).then(() => {
                cy.doLDAPLogin(testSettings).then(() => {
                    const randomTeam = String(getRandomInt(10000));
                    cy.skipOrCreateTeam(testSettings, randomTeam).then(() => {
                        cy.doLDAPLogout(testSettings);
                    });
                });
            });

            cy.doLDAPLogin(testSettings).then(() => {
                cy.doLDAPLogout(testSettings);
            });
        });
    });

    describe('LDAP Admin Login', () => {
        it('LDAP login new and existing MM admin(userType=Admin)', () => {
            testSettings.user = admin1;
            newConfig.LdapSettings.EnableAdminFilter = true;
            newConfig.LdapSettings.AdminFilter = '(cn=dev*)';
            cy.apiUpdateConfig(newConfig).then(() => {
                cy.doLDAPLogin(testSettings).then(() => {
                    const randomTeam = String(getRandomInt(10000));
                    cy.skipOrCreateTeam(testSettings, randomTeam).then(() => {
                        cy.doLDAPLogout(testSettings);
                    });
                });
            });

            cy.doLDAPLogin(testSettings).then(() => {
                cy.doLDAPLogout(testSettings);
            });
        });
    });

    describe('LDAP Guest Login', () => {
        it('LDAP login new and existing guest member', () => {
            testSettings.user = guest1;
            newConfig.LdapSettings.GuestFilter = '(cn=board*)';
            cy.apiUpdateConfig(newConfig).then(() => {
                cy.doLDAPLogin(testSettings).then(() => {
                    cy.skipOrCreateTeam(testSettings, 'board-1').then(() => {
                        cy.doGuestLogout(testSettings);
                    });
                });
            });

            cy.doLDAPLogin(testSettings).then(() => {
                cy.doGuestLogout(testSettings);
            });
        });

        it('LDAP login invited Guest user to a team', () => {
            testSettings.user = admin1;

            //login as an admin user - generate an invite
            cy.doLDAPLogin(testSettings).then(() => {
                cy.skipOrCreateTeam(testSettings, 'hello').then(() => {

                    //get invite
                    cy.doInviteGuest(guest1, testSettings).then(() => {
                        cy.doLDAPLogout(testSettings).then(() => {
                            testSettings.user = guest1;
                            cy.doLDAPLogin(testSettings, true).then(() => {
                                //login the guest
                                cy.checkLeftSideBar(testSettings).then(() => {
                                    cy.doLDAPLogout(testSettings);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});