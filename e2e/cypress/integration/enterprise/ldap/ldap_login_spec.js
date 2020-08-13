// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. #. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @ldap

import users from '../../../fixtures/ldap_users.json';
import {getRandomId} from '../../../utils';
import * as TIMEOUTS from '../../../fixtures/timeouts';

function setLDAPTestSettings(config) {
    return {
        siteName: config.TeamSettings.SiteName,
        siteUrl: config.ServiceSettings.SiteURL,
        teamName: '',
        user: null,
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

    describe('LDAP Login flow - Admin Login', () => {
        before(() => {
            // * Check if server has license for LDAP
            cy.apiRequireLicenseForFeature('LDAP');

            cy.apiGetConfig().then(({config}) => {
                testSettings = setLDAPTestSettings(config);
            });
        });

        it('LDAP login new MM admin, create team', () => {
            testSettings.user = admin1;
            const ldapSetting = {
                LdapSettings: {
                    EnableAdminFilter: true,
                    AdminFilter: '(cn=dev*)',
                },
            };
            cy.apiUpdateConfig(ldapSetting).then(() => {
                cy.doLDAPLogin(testSettings).then(() => {
                    // new user create team
                    cy.skipOrCreateTeam(testSettings, getRandomId()).then(() => {
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
            const ldapSetting = {
                LdapSettings: {
                    UserFilter: '(cn=no_users)',
                },
            };
            cy.apiAdminLogin().then(() => {
                cy.apiUpdateConfig(ldapSetting).then(() => {
                    cy.doLDAPLogin(testSettings).then(() => {
                        cy.checkLoginFailed(testSettings);
                    });
                });
            });
        });

        it('LDAP login, new MM user, no channels', () => {
            testSettings.user = user1;
            const ldapSetting = {
                LdapSettings: {
                    UserFilter: '(cn=test*)',
                },
            };
            cy.apiAdminLogin().then(() => {
                cy.apiUpdateConfig(ldapSetting).then(() => {
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
            const ldapSetting = {
                LdapSettings: {
                    GuestFilter: '(cn=no_guests)',
                },
            };
            cy.apiAdminLogin().then(() => {
                cy.apiUpdateConfig(ldapSetting).then(() => {
                    cy.doLDAPLogin(testSettings).then(() => {
                        cy.url().should('include', 'town-square');
                        cy.findAllByLabelText('town square public channel', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
                        cy.doMemberLogout(testSettings);
                    });
                });
            });
        });

        it('LDAP login, new guest, no channels', () => {
            testSettings.user = guest1;
            const ldapSetting = {
                LdapSettings: {
                    GuestFilter: '(cn=board*)',
                },
            };
            cy.apiAdminLogin().then(() => {
                cy.apiUpdateConfig(ldapSetting).then(() => {
                    cy.doLDAPLogin(testSettings).then(() => {
                        cy.doGuestLogout(testSettings);
                    });
                });
            });
        });
    });

    describe('LDAP Add Member and Guest to teams and test logins', () => {
        before(() => {
            cy.apiAdminLogin();

            cy.apiGetTeamByName(testSettings.teamName).then(({team}) => {
                cy.apiGetChannelByName(testSettings.teamName, 'town-square').then((r2) => {
                    const channelId = r2.body.id;
                    cy.apiGetUserByEmail(guest1.email).then(({user}) => {
                        cy.apiAddUserToTeam(team.id, user.id).then(() => {
                            cy.apiAddUserToChannel(channelId, user.id);
                        });
                    });

                    // add member user to team
                    cy.apiGetUserByEmail(user1.email).then(({user}) => {
                        cy.apiAddUserToTeam(team.id, user.id);
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
