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
    let testChannel
    let testTeam;


    describe('LDAP Group Sync Automated Tests', () => {
        before(() => {
            // * Check if server has license for LDAP
            cy.apiRequireLicenseForFeature('LDAP');

            cy.apiInitSetup().then(({team, user}) => {
                testTeam = team;

                cy.apiGetConfig().then(({config}) => {
                    testSettings = setLDAPTestSettings(config);
                });
    
                // # Login as sysadmin and add board-one to test team
                cy.apiAdminLogin();
    
                // # Link board group
                cy.visit('/admin_console/user_management/groups');
                cy.get('#board_group').then((el) => {
                    if (!el.text().includes('Edit')) {
                        // # Link the Group if its not linked before
                        if (el.find('.icon.fa-unlink').length > 0) {
                            el.find('.icon.fa-unlink').click();
                        }
                    }
                });
    
                // # Link board group
                cy.visit('/admin_console/user_management/groups');
                cy.get('#developers_group').then((el) => {
                    if (!el.text().includes('Edit')) {
                        // # Link the Group if its not linked before
                        if (el.find('.icon.fa-unlink').length > 0) {
                            el.find('.icon.fa-unlink').click();
                        }
                    }
                });
    
                cy.apiCreateChannel(testTeam.id, 'ldap-group-sync-automated-tests', 'ldap-group-sync-automated-tests').then((response) => {
                    testChannel = response.body;
                });
            });

        });

        it('MM-T1537 - Sync Group Removal from Channel Configuration Page', () => {
            // # Login as sysadmin and add board-one to test team
            cy.apiAdminLogin();
            cy.visit(`/admin_console/user_management/channels/${testChannel.id}`);
            cy.wait(2000);

            cy.findByTestId('addGroupsToChannelToggle').click();
            cy.get('#multiSelectList').should('be.visible');
            cy.get('#multiSelectList>div').children().eq(0).click();
            cy.get('#saveItems').click();

            cy.findByTestId('addGroupsToChannelToggle').click();
            cy.get('#multiSelectList').should('be.visible');
            cy.get('#multiSelectList>div').children().eq(0).click();
            cy.get('#saveItems').click();

            cy.get('#saveSetting').should('be.enabled').click({force: true});
            cy.wait(1000);

            cy.visit(`/admin_console/user_management/channels/${testChannel.id}`);
            cy.wait(1000);

            cy.get('.group-row').eq(0).scrollIntoView().should('be.visible').within(() => {
                cy.get('.group-name').should('have.text', 'board');
                cy.get('.group-actions > a').should('have.text', 'Remove').click({force: true});
            });

            cy.get('#saveSetting').should('be.enabled').click({force: true});
            cy.wait(1000);

            cy.visit(`/admin_console/user_management/channels/${testChannel.id}`);
            cy.wait(1000);

            cy.get('.group-row').should('have.length', 1);
        });

        // it('LDAP login existing MM admin', () => {
        //     // existing user, verify and logout
        //     cy.doLDAPLogin(testSettings).then(() => {
        //         cy.doLDAPLogout(testSettings);
        //     });
        // });
    });

    // describe('LDAP Login flow - Member Login)', () => {
    //     it('Invalid login with user filter', () => {
    //         testSettings.user = user1;
    //         const ldapSetting = {
    //             LdapSettings: {
    //                 UserFilter: '(cn=no_users)',
    //             },
    //         };
    //         cy.apiAdminLogin().then(() => {
    //             cy.apiUpdateConfig(ldapSetting).then(() => {
    //                 cy.doLDAPLogin(testSettings).then(() => {
    //                     cy.checkLoginFailed(testSettings);
    //                 });
    //             });
    //         });
    //     });

    //     it('LDAP login, new MM user, no channels', () => {
    //         testSettings.user = user1;
    //         const ldapSetting = {
    //             LdapSettings: {
    //                 UserFilter: '(cn=test*)',
    //             },
    //         };
    //         cy.apiAdminLogin().then(() => {
    //             cy.apiUpdateConfig(ldapSetting).then(() => {
    //                 cy.doLDAPLogin(testSettings).then(() => {
    //                     cy.doMemberLogout(testSettings);
    //                 });
    //             });
    //         });
    //     });
    // });

    // describe('LDAP Login flow - Guest Login', () => {
    //     it('Invalid login with guest filter', () => {
    //         testSettings.user = guest1;
    //         const ldapSetting = {
    //             LdapSettings: {
    //                 GuestFilter: '(cn=no_guests)',
    //             },
    //         };
    //         cy.apiAdminLogin().then(() => {
    //             cy.apiUpdateConfig(ldapSetting).then(() => {
    //                 cy.doLDAPLogin(testSettings).then(() => {
    //                     cy.get('#createPublicChannel').should('be.visible');
    //                     cy.doMemberLogout(testSettings);
    //                 });
    //             });
    //         });
    //     });

    //     it('LDAP login, new guest, no channels', () => {
    //         testSettings.user = guest1;
    //         const ldapSetting = {
    //             LdapSettings: {
    //                 GuestFilter: '(cn=board*)',
    //             },
    //         };
    //         cy.apiAdminLogin().then(() => {
    //             cy.apiUpdateConfig(ldapSetting).then(() => {
    //                 cy.doLDAPLogin(testSettings).then(() => {
    //                     cy.doGuestLogout(testSettings);
    //                 });
    //             });
    //         });
    //     });
    // });

    // describe('LDAP Add Member and Guest to teams and test logins', () => {
    //     before(() => {
    //         cy.apiAdminLogin();

    //         cy.apiGetTeamByName(testSettings.teamName).then(({team}) => {
    //             cy.apiGetChannelByName(testSettings.teamName, 'town-square').then((r2) => {
    //                 const channelId = r2.body.id;
    //                 cy.apiGetUserByEmail(guest1.email).then(({user}) => {
    //                     cy.apiAddUserToTeam(team.id, user.id).then(() => {
    //                         cy.apiAddUserToChannel(channelId, user.id);
    //                     });
    //                 });

    //                 // add member user to team
    //                 cy.apiGetUserByEmail(user1.email).then(({user}) => {
    //                     cy.apiAddUserToTeam(team.id, user.id);
    //                 });
    //             });
    //         });
    //     });

    //     it('LDAP Member login with team invite', () => {
    //         testSettings.user = user1;
    //         cy.doLDAPLogin(testSettings).then(() => {
    //             cy.doLDAPLogout(testSettings);
    //         });
    //     });

    //     it('LDAP Guest login with team invite', () => {
    //         testSettings.user = guest1;
    //         cy.doLDAPLogin(testSettings).then(() => {
    //             cy.doGuestLogout(testSettings);
    //         });
    //     });
    // });
});
