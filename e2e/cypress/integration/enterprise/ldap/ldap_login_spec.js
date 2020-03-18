// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import users from '../../../fixtures/ldap_users.json';
import {getRandomInt} from '../../../utils';

// TODO: UPDATE THIS
// assumes thet CYPRESS_* variables are set
// assumes that E20 license is uploaded

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
            LdapServer: 'ldap.e2e.dev.spinmint.com', //Cypress.env('ldapServer'), //'localhost'
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

    describe('LDAP Login flow - Admin Login', () => {
        before(() => {
            cy.apiUpdateConfig(newConfig).then(() => {
                cy.apiGetConfig().then((response) => {
                    cy.setLDAPTestSettings(response.body).then((_response) => {
                        testSettings = _response;
                    });
                });
            });
        });

        it('LDAP login new MM admin, create team', () => {
            testSettings.user = admin1;
            newConfig.LdapSettings.EnableAdminFilter = true;
            newConfig.LdapSettings.AdminFilter = '(cn=dev*)';
            cy.apiUpdateConfig(newConfig).then(() => {
                cy.doLDAPLogin(testSettings).then(() => {
                    // new user create team
                    const randomTeam = String(getRandomInt(10000));
                    cy.skipOrCreateTeam(testSettings, randomTeam).then(() => {
                        cy.doLDAPLogout(testSettings);
                    });
                });
            });
        });

        it('LDAP login existing MM admin', () => {
            // existing user, verify and logout
            cy.doLDAPLogin(testSettings).then(() => {
                cy.doLDAPLogout(testSettings);
            });
        });        
    });

    describe('LDAP Login flow - Member Login)', () => {
        it('Invalid login with user filter', () => {
            testSettings.user = user1;
            newConfig.LdapSettings.UserFilter = '(cn=no_users)';
            cy.apiUpdateConfig(newConfig).then(() => {
                cy.doLDAPLogin(testSettings).then(() => {
                    cy.checkLoginFailed(testSettings);
                });
            });
        });

        it('LDAP login, new MM user, no channels', () => {
            testSettings.user = user1;
            newConfig.LdapSettings.UserFilter = '(cn=test*)';
            cy.apiUpdateConfig(newConfig).then(() => {
                cy.doLDAPLogin(testSettings).then(() => {
                    cy.doMemberLogout(testSettings);
                });
            });
        });
    });


    describe('LDAP Login flow - Guest Login', () => {
        it('Invalid login with guest filter', () => {
            testSettings.user = guest1;
            newConfig.LdapSettings.GuestFilter = '(cn=no_guests)';
            cy.apiUpdateConfig(newConfig).then(() => {
                cy.doLDAPLogin(testSettings).then(() => {
                    cy.checkLoginFailed(testSettings);
                });
            });
        });

        it('LDAP login, new guest, no channels', () => {
            testSettings.user = guest1;
            newConfig.LdapSettings.GuestFilter = '(cn=board*)';
            cy.apiUpdateConfig(newConfig).then(() => {
                cy.doLDAPLogin(testSettings).then(() => {
                    cy.doGuestLogout(testSettings);
                });
            });
        });
    });

    describe('LDAP Add Member and Guest to teams and test logins', () => {
        // Add to teams
        it('Add LDAP Member/Guest to team', () => {
            testSettings.user = admin1;
            cy.doLDAPLogin(testSettings).then(() => {
                cy.doInviteGuest(guest1, testSettings).then(() => {
                    cy.doInviteMember(user1, testSettings).then(() => {
                        cy.doLDAPLogout(testSettings);
                    });
                });
            });
        });

        it('LDAP Member login with team invite', () => {
            testSettings.user = user1;
            cy.doLDAPLogin(testSettings).then(() => {
                cy.doLDAPLogout(testSettings);
            });
        });

        it('LDAP Guest login with team invite', () => {
            testSettings.user = guest1;
            cy.doLDAPLogin(testSettings).then(() => {
                cy.doGuestLogout(testSettings);
            });
        });
    });
});