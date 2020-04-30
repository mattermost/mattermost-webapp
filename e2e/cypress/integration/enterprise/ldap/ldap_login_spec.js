// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. #. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @ldap

import users from '../../../fixtures/ldap_users.json';
import {getRandomInt} from '../../../utils';

function setLDAPTestSettings(config) {
    return {
        siteName: config.TeamSettings.SiteName,
        siteUrl: config.ServiceSettings.SiteURL,
        teamName: '',
        user: null
    };
}

// assumes the CYPRESS_* variables are set
// assumes that E20 license is uploaded
// for setup with AWS: Follow the instructions mentioned in the mattermost/platform-private/config/ldap-test-setup.txt file
context('ldap', () => {
    const user1 = users['test-1'];
    const guest1 = users['board-1'];
    const admin1 = users['dev-1'];

    let testSettings;

    const newConfig = {
        ServiceSettings: {
            SiteURL: Cypress.config('baseUrl'),
        },
        LdapSettings: {
            Enable: true,
            EnableSync: false,
            LdapServer: Cypress.env('ldapServer'),
            LdapPort: Cypress.env('ldapPort'),
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
            // * Check if server has license for LDAP
            cy.requireLicenseForFeature('LDAP');

            cy.apiLogin('sysadmin');
            cy.apiUpdateConfig(newConfig).then(() => {
                cy.apiGetConfig().then((response) => {
                    testSettings = setLDAPTestSettings(response.body);
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
                        cy.get('#headerTeamName').should('be.visible').then((teamName) => {
                            testSettings.teamName = teamName.text();
                        });
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
            cy.apiLogin('sysadmin').then(() => {
                cy.apiUpdateConfig(newConfig).then(() => {
                    cy.doLDAPLogin(testSettings).then(() => {
                        cy.checkLoginFailed(testSettings);
                    });
                });
            });
        });

        it('LDAP login, new MM user, no channels', () => {
            testSettings.user = user1;
            newConfig.LdapSettings.UserFilter = '(cn=test*)';
            cy.apiLogin('sysadmin').then(() => {
                cy.apiUpdateConfig(newConfig).then(() => {
                    cy.doLDAPLogin(testSettings).then(() => {
                        cy.doMemberLogout(testSettings);
                    });
                });
            });
        });
    });

    describe('LDAP Login flow - Guest Login', () => {
        it('Invalid login with guest filter', () => {
            testSettings.user = guest1;
            newConfig.LdapSettings.GuestFilter = '(cn=no_guests)';
            cy.apiLogin('sysadmin').then(() => {
                cy.apiUpdateConfig(newConfig).then(() => {
                    cy.doLDAPLogin(testSettings).then(() => {
                        cy.checkLoginFailed(testSettings);
                    });
                });
            });
        });

        it('LDAP login, new guest, no channels', () => {
            testSettings.user = guest1;
            newConfig.LdapSettings.GuestFilter = '(cn=board*)';
            cy.apiLogin('sysadmin').then(() => {
                cy.apiUpdateConfig(newConfig).then(() => {
                    cy.doLDAPLogin(testSettings).then(() => {
                        cy.doGuestLogout(testSettings);
                    });
                });
            });
        });
    });

    describe('LDAP Add Member and Guest to teams and test logins', () => {
        before(() => {
            cy.apiLogin('sysadmin');

            cy.apiGetTeamByName(testSettings.teamName).then((r) => {
                const teamId = r.body.id;
                cy.apiGetChannelByName(testSettings.teamName, 'town-square').then((r2) => {
                    const channelId = r2.body.id;
                    cy.apiGetUserByEmail(guest1.email).then((res) => {
                        const user = res.body;
                        cy.apiAddUserToTeam(teamId, user.id).then(() => {
                            cy.apiAddUserToChannel(channelId, user.id);
                        });
                    });

                    // add member user to team
                    cy.apiGetUserByEmail(user1.email).then((res) => {
                        const user = res.body;
                        cy.apiAddUserToTeam(teamId, user.id);
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
