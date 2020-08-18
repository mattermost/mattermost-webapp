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
    
                // # Link developers group
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

        // it('MM-T1537 - Sync Group Removal from Channel Configuration Page', () => {
        //     // # Login as sysadmin and add board-one to test team
        //     cy.apiAdminLogin();
        //     cy.visit(`/admin_console/user_management/channels/${testChannel.id}`);
        //     cy.wait(2000);

        //     cy.findByTestId('addGroupsToChannelToggle').click();
        //     cy.get('#multiSelectList').should('be.visible');
        //     cy.get('#multiSelectList>div').children().eq(0).click();
        //     cy.get('#saveItems').click();

        //     cy.findByTestId('addGroupsToChannelToggle').click();
        //     cy.get('#multiSelectList').should('be.visible');
        //     cy.get('#multiSelectList>div').children().eq(0).click();
        //     cy.get('#saveItems').click();

        //     cy.get('#saveSetting').should('be.enabled').click({force: true});
        //     cy.wait(1000);

        //     cy.visit(`/admin_console/user_management/channels/${testChannel.id}`);
        //     cy.wait(1000);

        //     cy.get('.group-row').eq(0).scrollIntoView().should('be.visible').within(() => {
        //         cy.get('.group-name').should('have.text', 'board');
        //         cy.get('.group-actions > a').should('have.text', 'Remove').click({force: true});
        //     });

        //     cy.get('#saveSetting').should('be.enabled').click({force: true});
        //     cy.wait(1000);

        //     cy.visit(`/admin_console/user_management/channels/${testChannel.id}`);
        //     cy.wait(1000);

        //     cy.get('.group-row').should('have.length', 1);
        // });

        // it('MM-T2618 - Team Configuration Page: Group removal User removed from sync\'ed team', () => {
        //     // # Login as sysadmin and add board-one to test team
        //     cy.apiAdminLogin();
        //     cy.visit(`/admin_console/user_management/teams/${testTeam.id}`);
        //     cy.wait(2000);

        //     cy.findByTestId('syncGroupSwitch').scrollIntoView().click();

        //     cy.findByTestId('addGroupsToTeamToggle').scrollIntoView().click();
        //     cy.get('#multiSelectList').should('be.visible');
        //     cy.get('#multiSelectList>div').children().eq(0).click();
        //     cy.get('#saveItems').click();

        //     cy.get('#saveSetting').should('be.enabled').click({force: true});
        //     cy.wait(1000);

        //     cy.get('#confirmModalButton').should('be.visible').click();

        //     cy.visit('/admin_console/user_management/groups');
        //     cy.get('#board_edit').click();

        //     cy.findByTestId(`${testTeam.display_name}_groupsyncable_remove`).click();
        //     cy.get('#confirmModalBody').should('be.visible').and('have.text', `Removing this membership will prevent future users in this group from being added to the ${testTeam.display_name} team.`);
        //     cy.get('#confirmModalButton').should('be.visible').click();
        //     cy.get('#saveSetting').click();
        // });

        it('MM-T2621 - Team List Management Column', () => {
            let testTeam2;
            // # Login as sysadmin and add board-one to test team
            cy.apiAdminLogin();
            cy.visit(`/admin_console/user_management/teams/${testTeam.id}`);
            cy.wait(2000);

            cy.findByTestId('allowAllToggleSwitch').scrollIntoView().click();

            cy.get('#saveSetting').should('be.enabled').click({force: true});
            cy.wait(1000);

            // # Start with a new team
            cy.apiCreateTeam('team', 'Team').then(({team}) => {
                testTeam2 = team;
                cy.visit('/admin_console/user_management/teams');

                // # Search for the team.
                cy.get('.DataGrid_searchBar').within(() => {
                    cy.findByPlaceholderText('Search').should('be.visible').type(`${testTeam.display_name}{enter}`);
                });

                cy.findByTestId(`${testTeam.name}_management`).should('have.text', 'Anyone Can Join');

                cy.get('.DataGrid_searchBar').within(() => {
                    cy.findByPlaceholderText('Search').should('be.visible').clear().type(`${testTeam2.display_name}{enter}`);
                });

                cy.findByTestId(`${testTeam2.name}_management`).should('have.text', 'Invite Only');
            });
        });


    });
});
