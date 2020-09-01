// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. #. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @ldap

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
    let testChannel;
    let testTeam;
    let testUser;

    describe('LDAP Group Sync Automated Tests', () => {
        beforeEach(() => {
            // * Check if server has license for LDAP
            cy.apiRequireLicenseForFeature('LDAP');

            // # Initial api setup
            cy.apiInitSetup().then(({team, user}) => {
                testTeam = team;
                testUser = user;

                // # Update LDAP settings
                cy.apiGetConfig().then(({config}) => {
                    setLDAPTestSettings(config);
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

                // # Create a test channel
                cy.apiCreateChannel(testTeam.id, 'ldap-group-sync-automated-tests', 'ldap-group-sync-automated-tests').then((response) => {
                    testChannel = response.body;
                });
            });
        });

        it('MM-T1537 - Sync Group Removal from Channel Configuration Page', () => {
            // # Login as sysadmin and link 2 groups to testChannel
            cy.apiAdminLogin();
            cy.visit(`/admin_console/user_management/channels/${testChannel.id}`);
            cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Channel Configuration');
            cy.wait(TIMEOUTS.TWO_SEC); //eslint-disable-line cypress/no-unnecessary-waiting

            // # Link first group
            cy.findByTestId('addGroupsToChannelToggle').click();
            cy.get('#multiSelectList').should('be.visible');
            cy.get('#multiSelectList>div').children().eq(0).click();
            cy.get('#saveItems').click();

            // # Link second group
            cy.findByTestId('addGroupsToChannelToggle').click();
            cy.get('#multiSelectList').should('be.visible');
            cy.get('#multiSelectList>div').children().eq(0).click();
            cy.get('#saveItems').click();

            // # Click save settings on bottom screen to save settings
            cy.get('#saveSetting').should('be.enabled').click();
            cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Mattermost Channels');

            // # Go back to the testChannel management page
            cy.visit(`/admin_console/user_management/channels/${testChannel.id}`);
            cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Channel Configuration');

            // # Remove the board group we have added
            cy.get('.group-row').eq(0).scrollIntoView().should('be.visible').within(() => {
                cy.get('.group-name').should('have.text', 'board');
                cy.get('.group-actions > a').should('have.text', 'Remove').click();
            });

            // # Save settings
            cy.get('#saveSetting').should('be.enabled').click();
            cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Channel Configuration');

            // # Go back to testChannel management page
            cy.visit(`/admin_console/user_management/channels/${testChannel.id}`);
            cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Channel Configuration');

            // * Ensure we only have one group row (other group is not there)
            cy.get('.group-row').should('have.length', 1);
        });

        it('MM-T2618 - Team Configuration Page: Group removal User removed from sync\'ed team', () => {
            // # Login as sysadmin and add board-one to test team
            cy.apiAdminLogin();
            cy.visit(`/admin_console/user_management/teams/${testTeam.id}`);
            cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Team Configuration');
            cy.wait(TIMEOUTS.TWO_SEC); //eslint-disable-line cypress/no-unnecessary-waiting

            // # Turn on sync group members
            cy.findByTestId('syncGroupSwitch').scrollIntoView().click();

            // # Add board group to team
            cy.findByTestId('addGroupsToTeamToggle').scrollIntoView().click();
            cy.get('#multiSelectList').should('be.visible');
            cy.get('#multiSelectList>div').children().eq(0).click();
            cy.get('#saveItems').click();

            // # Save settings
            cy.get('#saveSetting').should('be.enabled').click();

            // # Accept confirmation modal
            cy.get('#confirmModalButton').should('be.visible').click();
            cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Mattermost Teams');

            // # Go to board group edit page
            cy.visit('/admin_console/user_management/groups');
            cy.get('#board_edit').click();

            // # Remove the group
            cy.findByTestId(`${testTeam.display_name}_groupsyncable_remove`).click();

            // * Ensure the confirmation modal shows with the following text
            cy.get('#confirmModalBody').should('be.visible').and('have.text', `Removing this membership will prevent future users in this group from being added to the ${testTeam.display_name} team.`);

            // # Accept the modal and save settings
            cy.get('#confirmModalButton').should('be.visible').click();
            cy.get('#saveSetting').click();
        });

        it('MM-T2621 - Team List Management Column', () => {
            let testTeam2;

            // # Login as system admin and go to testTeam config page
            cy.apiAdminLogin();
            cy.visit(`/admin_console/user_management/teams/${testTeam.id}`);
            cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Team Configuration');
            cy.wait(TIMEOUTS.TWO_SEC); //eslint-disable-line cypress/no-unnecessary-waiting

            // # Make the team so anyone can join it
            cy.findByTestId('allowAllToggleSwitch').scrollIntoView().click();

            // # Save the settings
            cy.get('#saveSetting').should('be.enabled').click();
            cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Mattermost Teams');

            // # Start with a new team
            cy.apiCreateTeam('team', 'Team').then(({team}) => {
                testTeam2 = team;

                // # Go to team management
                cy.visit('/admin_console/user_management/teams');

                // # Search for the team testTeam
                cy.get('.DataGrid_searchBar').within(() => {
                    cy.findByPlaceholderText('Search').should('be.visible').type(`${testTeam.display_name}{enter}`);
                });

                // * Ensure anyone can join text shows
                cy.findByTestId(`${testTeam.name}Management`).should('have.text', 'Anyone Can Join');

                // * Search for second team we just made
                cy.get('.DataGrid_searchBar').within(() => {
                    cy.findByPlaceholderText('Search').should('be.visible').clear().type(`${testTeam2.display_name}{enter}`);
                });

                // * Ensure the management text shows Invite only
                cy.findByTestId(`${testTeam2.name}Management`).should('have.text', 'Invite Only');
            });
        });

        it('MM-T2628 - List of Channels', () => {
            // # Login as sysadmin and add board-one to test team
            cy.apiAdminLogin();
            cy.visit(`/admin_console/user_management/channels/${testChannel.id}`);
            cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Channel Configuration');
            cy.wait(TIMEOUTS.TWO_SEC); //eslint-disable-line cypress/no-unnecessary-waiting

            // Make it private and then cancel
            cy.findByTestId('allow-all-toggle').click();
            cy.get('#cancelButtonSettings').click();
            cy.get('#confirmModalButton').click();
            cy.visit(`/admin_console/user_management/channels/${testChannel.id}`);
            cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Channel Configuration');

            // * Ensure it still public
            cy.findByTestId('allow-all-toggle').should('has.have.text', 'Public');

            // Make it private and save
            cy.findByTestId('allow-all-toggle').click();
            cy.get('#saveSetting').should('be.enabled').click();
            cy.get('#confirmModalButton').click();

            // # Visit the channel config page for testChannel
            cy.visit(`/admin_console/user_management/channels/${testChannel.id}`);
            cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Channel Configuration');

            // * Ensure it is Private
            cy.findByTestId('allow-all-toggle').should('has.have.text', 'Private');

            // # Go to team page to look for this channel in public chnnale directory
            cy.visit(`/${testTeam.name}`);
            cy.get('#sidebarPublicChannelsMore').click();

            // * Search private channel name and make sure it isn't there in public channel directory
            cy.get('#searchChannelsTextbox').type(`${testChannel.display_name}`);
            cy.get('#moreChannelsList').should('include.text', 'No more channels to join');
        });

        it('MM-T2629 - Private to public - More....', () => {
            // # Create new test channel that is private
            cy.apiCreateChannel(
                testTeam.id,
                'private-channel-test',
                'Private channel',
                'P',
            ).then((res) => {
                const privateChannel = res.body;

                // # Login as sysadmin
                cy.apiAdminLogin();
                cy.visit(`/admin_console/user_management/channels/${privateChannel.id}`);
                cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Channel Configuration');

                // Make it public and then cancel
                cy.findByTestId('allow-all-toggle').click();
                cy.get('#cancelButtonSettings').click();
                cy.get('#confirmModalButton').click();
                cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Mattermost Channels');

                // Reload
                cy.visit(`/admin_console/user_management/channels/${privateChannel.id}`);
                cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Channel Configuration');
                cy.wait(TIMEOUTS.THREE_SEC); //eslint-disable-line cypress/no-unnecessary-waiting

                // Make it public and save
                // * Ensure it still showing the channel as private
                cy.findByTestId('allow-all-toggle').should('has.have.text', 'Private').click();
                cy.get('#saveSetting').should('be.enabled').click();
                cy.get('#confirmModalButton').click();
                cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Mattermost Channels');

                // Reload
                cy.visit(`/admin_console/user_management/channels/${privateChannel.id}`);
                cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Channel Configuration');

                // * Ensure it still showing the channel as private
                cy.findByTestId('allow-all-toggle').should('has.have.text', 'Public');

                // # Ensure the last message in the message says that it was converted to a public channel
                cy.visit(`/${testTeam.name}/channels/${privateChannel.name}`);
                cy.getLastPostId().then((id) => {
                    // * The system message should contain 'This channel has been converted to a Public Channel and can be joined by any team member'
                    cy.get(`#postMessageText_${id}`).should('contain', 'This channel has been converted to a Public Channel and can be joined by any team member');
                });
            });
        });

        it('MM-T2630 - Default channel cannot be toggled to private', () => {
            cy.visit('/admin_console/user_management/channels');

            // # Search for the channel town square
            cy.get('.DataGrid_searchBar').within(() => {
                cy.findByPlaceholderText('Search').should('be.visible').type('Town Square');
            });
            cy.wait(TIMEOUTS.FIVE_SEC); //eslint-disable-line cypress/no-unnecessary-waiting

            cy.findAllByTestId('town-squareedit').then((elements) => {
                elements[0].click();
                cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Channel Configuration');

                // * Ensure the toggle to private/public is disabled
                cy.findByTestId('allow-all-toggle-button').should('be.disabled');
            });
        });

        it('MM-T2638 - Permalink from when public does not auto-join (non-system-admin) after converting to private', () => {
            cy.apiLogin(testUser);

            cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

            // # Post message to use
            cy.postMessage('DONT YOU SEE I GOT EVERYTHING YOU NEED .... BABY BABY DONT YOU SEE SEE I GOT EVERYTHING YOU NEED NEED ... ;)');

            cy.getLastPostId().then((id) => {
                const postId = id;

                // # Visit the channel
                cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

                // # Post /leave command in testChannel to leave it
                cy.postMessage('/leave');
                cy.get('#channelHeaderTitle', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('contain', 'Town Square');

                // Visit the permalink link
                cy.visit(`/${testTeam.name}/pl/${postId}`);

                // * Ensure the header of the permalink channel is what we expect it to be (testChannel)
                cy.get('#channelHeaderTitle', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('contain', testChannel.display_name);

                // # Leave the channel again
                cy.postMessage('/leave');
                cy.get('#channelHeaderTitle', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('contain', 'Town Square');

                // # Login as sysadmin and convert testChannel to private channel
                cy.apiAdminLogin();
                cy.apiPatchChannelPrivacy(testChannel.id, 'P');

                // # Login as normal user and try to visit the permalink
                cy.apiLogin(testUser);
                cy.visit(`/${testTeam.name}/pl/${postId}`);

                // * We expect an error that says "Message not found"
                cy.findByTestId('errorMessageTitle').contains('Message Not Found');
            });
        });
    });
});
