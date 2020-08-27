// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. #. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @ldap

import users from '../../../fixtures/ldap_users.json';

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
    // const user1 = users['test-1'];
    // const guest1 = users['board-1'];
    // const admin1 = users['dev-1'];

    let testSettings;
    let testChannel;
    let testTeam;
    let testUser;

    describe('LDAP Group Sync Automated Tests', () => {
        beforeEach(() => {
            // * Check if server has license for LDAP
            cy.apiRequireLicenseForFeature('LDAP');

            cy.apiInitSetup().then(({team, user}) => {
                testTeam = team;
                testUser = user;

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
        //     cy.wait(2000); //eslint-disable-line cypress/no-unnecessary-waiting

        //     cy.findByTestId('addGroupsToChannelToggle').click();
        //     cy.get('#multiSelectList').should('be.visible');
        //     cy.get('#multiSelectList>div').children().eq(0).click();
        //     cy.get('#saveItems').click();

        //     cy.findByTestId('addGroupsToChannelToggle').click();
        //     cy.get('#multiSelectList').should('be.visible');
        //     cy.get('#multiSelectList>div').children().eq(0).click();
        //     cy.get('#saveItems').click();

        //     cy.get('#saveSetting').should('be.enabled').click({force: true});
        //     cy.wait(1000); //eslint-disable-line cypress/no-unnecessary-waiting

        //     cy.visit(`/admin_console/user_management/channels/${testChannel.id}`);
        //     cy.wait(1000); //eslint-disable-line cypress/no-unnecessary-waiting

        //     cy.get('.group-row').eq(0).scrollIntoView().should('be.visible').within(() => {
        //         cy.get('.group-name').should('have.text', 'board');
        //         cy.get('.group-actions > a').should('have.text', 'Remove').click({force: true});
        //     });

        //     cy.get('#saveSetting').should('be.enabled').click({force: true});
        //     cy.wait(1000); //eslint-disable-line cypress/no-unnecessary-waiting

        //     cy.visit(`/admin_console/user_management/channels/${testChannel.id}`);
        //     cy.wait(1000); //eslint-disable-line cypress/no-unnecessary-waiting

        //     cy.get('.group-row').should('have.length', 1);
        // });

        // it('MM-T2618 - Team Configuration Page: Group removal User removed from sync\'ed team', () => {
        //     // # Login as sysadmin and add board-one to test team
        //     cy.apiAdminLogin();
        //     cy.visit(`/admin_console/user_management/teams/${testTeam.id}`);
        //     cy.wait(2000); //eslint-disable-line cypress/no-unnecessary-waiting

        //     cy.findByTestId('syncGroupSwitch').scrollIntoView().click();

        //     cy.findByTestId('addGroupsToTeamToggle').scrollIntoView().click();
        //     cy.get('#multiSelectList').should('be.visible');
        //     cy.get('#multiSelectList>div').children().eq(0).click();
        //     cy.get('#saveItems').click();

        //     cy.get('#saveSetting').should('be.enabled').click({force: true});
        //     cy.wait(1000); //eslint-disable-line cypress/no-unnecessary-waiting

        //     cy.get('#confirmModalButton').should('be.visible').click();

        //     cy.visit('/admin_console/user_management/groups');
        //     cy.get('#board_edit').click();

        //     cy.findByTestId(`${testTeam.display_name}_groupsyncable_remove`).click();
        //     cy.get('#confirmModalBody').should('be.visible').and('have.text', `Removing this membership will prevent future users in this group from being added to the ${testTeam.display_name} team.`);
        //     cy.get('#confirmModalButton').should('be.visible').click();
        //     cy.get('#saveSetting').click();
        // });

        // it('MM-T2621 - Team List Management Column', () => {
        //     let testTeam2;

        //     // # Login as sysadmin and add board-one to test team
        //     cy.apiAdminLogin();
        //     cy.visit(`/admin_console/user_management/teams/${testTeam.id}`);
        //     cy.wait(2000); //eslint-disable-line cypress/no-unnecessary-waiting

        //     cy.findByTestId('allowAllToggleSwitch').scrollIntoView().click();

        //     cy.get('#saveSetting').should('be.enabled').click({force: true});
        //     cy.wait(1000); //eslint-disable-line cypress/no-unnecessary-waiting

        //     // # Start with a new team
        //     cy.apiCreateTeam('team', 'Team').then(({team}) => {
        //         testTeam2 = team;
        //         cy.visit('/admin_console/user_management/teams');

        //         // # Search for the team.
        //         cy.get('.DataGrid_searchBar').within(() => {
        //             cy.findByPlaceholderText('Search').should('be.visible').type(`${testTeam.display_name}{enter}`);
        //         });

        //         cy.findByTestId(`${testTeam.name}_management`).should('have.text', 'Anyone Can Join');

        //         cy.get('.DataGrid_searchBar').within(() => {
        //             cy.findByPlaceholderText('Search').should('be.visible').clear().type(`${testTeam2.display_name}{enter}`);
        //         });

        //         cy.findByTestId(`${testTeam2.name}_management`).should('have.text', 'Invite Only');
        //     });
        // });

        // it('MM-T2628 - List of Channels', () => {
        //     // # Login as sysadmin and add board-one to test team
        //     cy.apiAdminLogin();
        //     cy.visit(`/admin_console/user_management/channels/${testChannel.id}`);
        //     cy.wait(2000); //eslint-disable-line cypress/no-unnecessary-waiting

        //     // Make it private and then cancel
        //     cy.findByTestId('allow-all-toggle').click();
        //     cy.get('#cancelButtonSettings').click();
        //     cy.get('#confirmModalButton').click();
        //     cy.visit(`/admin_console/user_management/channels/${testChannel.id}`);
        //     cy.wait(2000); //eslint-disable-line cypress/no-unnecessary-waiting
        //     cy.findByTestId('allow-all-toggle').should('has.have.text', 'Public');

        //     // Make it private
        //     cy.findByTestId('allow-all-toggle').click();
        //     cy.get('#saveSetting').should('be.enabled').click({force: true});
        //     cy.get('#confirmModalButton').click();
        //     cy.visit(`/${testTeam.name}`);
        //     cy.get('#sidebarPublicChannelsMore').click();

        //     // * Search private channel name and make sure it isn't there
        //     cy.get('#searchChannelsTextbox').type(`${testChannel.display_name}`);
        //     cy.get('#moreChannelsList').should('include.text', 'No more channels to join');
        // });


        // it('MM-T2629 - Private to public - More....', () => {
        //     // # Create new test channel
        //     cy.apiCreateChannel(
        //         testTeam.id,
        //         'private-channel-test',
        //         'Private channel',
        //         'P',
        //     ).then((res) => {
        //         const privateChannel = res.body;

        //         // # Login as sysadmin and add board-one to test team
        //         cy.apiAdminLogin();
        //         cy.visit(`/admin_console/user_management/channels/${privateChannel.id}`);
        //         cy.wait(2000); //eslint-disable-line cypress/no-unnecessary-waiting

        //         // Make it public and then cancel
        //         cy.findByTestId('allow-all-toggle').click();
        //         cy.get('#cancelButtonSettings').click();
        //         cy.get('#confirmModalButton').click();
        //         cy.visit(`/admin_console/user_management/channels/${privateChannel.id}`);
        //         cy.wait(2000); //eslint-disable-line cypress/no-unnecessary-waiting
        //         cy.findByTestId('allow-all-toggle').should('has.have.text', 'Private');

        //         // Make it public
        //         cy.findByTestId('allow-all-toggle').click();
        //         cy.get('#saveSetting').should('be.enabled').click({force: true});
        //         cy.get('#confirmModalButton').click();

        //         // # Ensure the last message in the message says that it was converted to a public chnanle
        //         cy.visit(`/${testTeam.name}/channels/${privateChannel.name}`);
        //         cy.wait(2000); //eslint-disable-line cypress/no-unnecessary-waiting
        //         cy.getLastPostId().then((id) => {
        //             // * The system message should contain 'This channel has been converted to a Public Channel and can be joined by any team member'
        //             cy.get(`#postMessageText_${id}`).should('contain', 'This channel has been converted to a Public Channel and can be joined by any team member');
        //         });
        //     });
        // });


        // it('MM-T2630 - Default channel cannot be toggled to private', () => {
        //     cy.visit('/admin_console/user_management/channels');

        //     // # Search for the channel.
        //     cy.get('.DataGrid_searchBar').within(() => {
        //         cy.findByPlaceholderText('Search').should('be.visible').type(`Town Square`);
        //     });
        //     cy.wait(2000); //eslint-disable-line cypress/no-unnecessary-waiting
        //     cy.findAllByTestId('town-squareedit').then((elements) => {
        //         elements[0].click();
        //         cy.wait(2000); //eslint-disable-line cypress/no-unnecessary-waiting
        //         cy.findByTestId('allow-all-toggle-button').should('be.disabled');
        //     });

        // });


        it('MM-T2638 - Permalink from when public does not auto-join (non-system-admin) after converting to private', () => {
            cy.apiLogin(testUser);

            cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

            // # Post message to use
            cy.postMessage('DONT YOU SEE I GOT EVERTYHING YOU NEED .... BABY BABY DONT YOU SEE SEE I GOT EVERYTHING YOU NEED NEED ... ;)');

            cy.getLastPostId().then((id) => {
                const postId = id;
                const permalink = `${Cypress.config('baseUrl')}/${testTeam.name}/pl/${postId}`;
                cy.visit(`/${testTeam.name}/channels/off-topic`);

                cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
                // # Post /leave command in center channel
                cy.postMessage('/leave');
                cy.wait(5000); // eslint-disable-line cypress/no-unnecessary-waiting

                cy.visit(`/${testTeam.name}/pl/${postId}`);
                cy.wait(5000);
                cy.get('#channelHeaderTitle').should('be.visible').should('contain', testChannel.display_name);
                
                cy.postMessage('/leave');
                cy.wait(5000); // eslint-disable-line cypress/no-unnecessary-waiting

                // # Login as sysadmin and add board-one to test team
                cy.apiAdminLogin();
                cy.apiPatchChannelPrivacy(testChannel.id, 'P');

                cy.apiLogin(testUser);
                cy.visit(`/${testTeam.name}/pl/${postId}`);

                cy.findByTestId('error-message-title').contains('Message Not Found');
            });

        });




    });
});
