// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @system_console @group_mentions

import ldapUsers from '../../../fixtures/ldap_users.json';
import * TIMEOUTS from '../../../fixtures/timeouts';

import {
    disablePermission,
    enablePermission,
} from '../system_console/channel_moderation/helpers';

// assumes the CYPRESS_* variables are set
// assumes that E20 license is uploaded
// for setup with AWS: Follow the instructions mentioned in the mattermost/platform-private/config/ldap-test-setup.txt file

describe('Group Mentions', () => {
    let groupID;
    let boardUser;
    let regularUser;
    let testTeam;

    before(() => {
        // * Check if server has license for LDAP Groups
        cy.apiRequireLicenseForFeature('LDAPGroups');

        // # Enable Guest Account Settings
        cy.apiUpdateConfig({
            GuestAccountsSettings: {
                Enable: true,
            },
        });

        cy.apiInitSetup().then(({team, user}) => {
            regularUser = user;
            testTeam = team;
        });

        // # Login as admin
        cy.apiAdminLogin();

        // # Test LDAP configuration and server connection
        // # Synchronize user attributes
        cy.apiLDAPTest();
        cy.apiLDAPSync();

        // # Link the LDAP Group - board
        cy.visit('/admin_console/user_management/groups');
        cy.get('#board_group').then((el) => {
            if (!el.text().includes('Edit')) {
                // # Link the Group if its not linked before
                if (el.find('.icon.fa-unlink').length > 0) {
                    el.find('.icon.fa-unlink').click();
                }
            }
        });

        // # Get board group id
        cy.apiGetGroups().then((res) => {
            res.body.forEach((group) => {
                if (group.display_name === 'board') {
                    // # Set groupID to navigate to group page directly
                    groupID = group.id;

                    // # Set allow reference false to ensure correct data for test cases
                    cy.apiPatchGroup(groupID, {allow_reference: false});
                }
            });
        });

        // # Login once as board user to ensure the user is created in the system
        boardUser = ldapUsers['board-1'];
        cy.apiLogin(boardUser);

        // # Login as sysadmin
        cy.apiAdminLogin();

        // # Add board user to test team to ensure that it exists in the team and set its preferences to skip tutorial step
        cy.apiGetUserByEmail(boardUser.email).then(({user}) => {
            cy.apiGetChannelByName(testTeam.name, 'town-square').then(({channel}) => {
                cy.apiAddUserToTeam(testTeam.id, user.id).then(() => {
                    cy.apiAddUserToChannel(channel.id, user.id);
                });
            });

            const preferences = [{
                user_id: user.id,
                category: 'tutorial_step',
                name: user.id,
                value: '999',
            }];
            cy.apiSaveUserPreference(preferences, user.id);
        });
    });

    after(() => {
        // # Login as sysadmin and navigate to system scheme page
        cy.apiAdminLogin();
        cy.visit('/admin_console/user_management/permissions/system_scheme');

        // # Click reset to defaults and confirm
        cy.findByTestId('resetPermissionsToDefault').click();
        cy.get('#confirmModalButton').click();

        // # Save
        saveConfig();
    });

    it('MM-T2450 - Group Mentions when user is a Channel Admin', () => {
        const groupName = `board_test_case_${Date.now()}`;

        // # Login as sysadmin and enable group mention with the group name
        cy.apiAdminLogin();
        enableGroupMention(groupName);

        // # Disable Group Mentions for All Users & Channel Admins
        cy.visit('/admin_console/user_management/permissions/system_scheme');
        disablePermission('all_users-posts-use_group_mentions-checkbox');
        disablePermission('channel_admin-posts-use_group_mentions-checkbox');
        saveConfig();

        // # Login as a regular user
        cy.apiLogin(regularUser);

        // # Create a new channel so that regular user can be channel admin
        cy.apiCreateChannel(testTeam.id, 'group-mention', 'Group Mentions').then(({channel}) => {
            // # Visit the channel
            cy.visit(`/${testTeam.name}/channels/${channel.name}`);

            // # Type the Group Name
            cy.get('#post_textbox').should('be.visible').clear().type(`@${groupName}`).wait(TIMEOUTS.TWO_SEC);

            // * Verify if autocomplete dropdown is not displayed
            cy.get('#suggestionList').should('not.be.visible');

            // # Submit a post containing the group mention
            cy.postMessage(`@${groupName}`);

            // * Verify if a system message is not displayed
            cy.getLastPostId().then((postId) => {
                cy.get(`#postMessageText_${postId}`).should('include.text', `@${groupName}`);

                // * Verify that the group mention is not highlighted
                cy.get(`#postMessageText_${postId}`).find('.mention--highlight').should('not.exist');

                // * Verify that the group mention does not has blue colored text
                cy.get(`#postMessageText_${postId}`).find('.group-mention-link').should('not.exist');
            });

            // # Enable Group Mentions for Channel Admins
            cy.apiAdminLogin();
            cy.visit('/admin_console/user_management/permissions/system_scheme');
            enablePermission('channel_admin-posts-use_group_mentions-checkbox');
            saveConfig();

            // # Login as a regular user and visit the channel
            cy.apiLogin(regularUser);
            cy.visit(`/${testTeam.name}/channels/${channel.name}`);

            // # Type the Group Name
            cy.get('#post_textbox').should('be.visible').clear().type(`@${groupName}`).wait(TIMEOUTS.TWO_SEC);

            // * Verify if autocomplete dropdown is displayed
            cy.get('#suggestionList').should('be.visible').children().within((el) => {
                cy.wrap(el).eq(0).should('contain', 'Group Mentions');
                cy.wrap(el).eq(1).should('contain', groupName);
            });

            // # Submit a post containing the group mention
            cy.postMessage(`@${groupName}`);

            // * Verify if a system message is displayed
            cy.getLastPostId().then((postId) => {
                cy.get(`#postMessageText_${postId}`).should('include.text', `@${boardUser.username} did not get notified by this mention because they are not in the channel. Would you like to add them to the channel? They will have access to all message history.`);

                // * Verify if an option should be given to add them to channel
                cy.get('a.PostBody_addChannelMemberLink').should('be.visible');
            });
        });
    });

    it('MM-T2451 - Group Mentions when user is a Team Admin', () => {
        const groupName = `board_test_case_${Date.now()}`;

        // # Login as sysadmin and enable group mention with the group name
        cy.apiAdminLogin();
        enableGroupMention(groupName);

        // # Disable Group Mentions for All Users & Channel Admins & Team Admins
        cy.visit('/admin_console/user_management/permissions/system_scheme');
        disablePermission('all_users-posts-use_group_mentions-checkbox');
        disablePermission('channel_admin-posts-use_group_mentions-checkbox');
        disablePermission('team_admin-posts-use_group_mentions-checkbox');
        saveConfig();

        // # Login as a regular user
        cy.apiLogin(regularUser);

        // # Create a new team and channel so that regular user can be team admin
        cy.apiCreateTeam('team', 'Test NoMember').then(({team}) => {
            cy.apiCreateChannel(team.id, 'group-mention', 'Group Mentions').then(({channel}) => {
                // # Visit the channel
                cy.visit(`/${team.name}/channels/${channel.name}`);

                // # Type the Group Name
                cy.get('#post_textbox').should('be.visible').clear().type(`@${groupName}`).wait(TIMEOUTS.TWO_SEC);

                // * Verify if autocomplete dropdown is not displayed
                cy.get('#suggestionList').should('not.be.visible');

                // # Submit a post containing the group mention
                cy.postMessage(`@${groupName}`);

                // * Verify if a system message is not displayed
                cy.getLastPostId().then((postId) => {
                    cy.get(`#postMessageText_${postId}`).should('include.text', `@${groupName}`);

                    // * Verify that the group mention is not highlighted
                    cy.get(`#postMessageText_${postId}`).find('.mention--highlight').should('not.exist');

                    // * Verify that the group mention does not has blue colored text
                    cy.get(`#postMessageText_${postId}`).find('.group-mention-link').should('not.exist');
                });

                // # Enable Group Mentions for Team Admins
                cy.apiAdminLogin();
                cy.visit('/admin_console/user_management/permissions/system_scheme');
                enablePermission('team_admin-posts-use_group_mentions-checkbox');
                saveConfig();

                // # Login as a regular user and visit the channel
                cy.apiLogin(regularUser);
                cy.visit(`/${team.name}/channels/${channel.name}`);

                // # Type the Group Name
                cy.get('#post_textbox').should('be.visible').clear().type(`@${groupName}`).wait(TIMEOUTS.TWO_SEC);

                // * Verify if autocomplete dropdown is displayed
                cy.get('#suggestionList').should('be.visible').children().within((el) => {
                    cy.wrap(el).eq(0).should('contain', 'Group Mentions');
                    cy.wrap(el).eq(1).should('contain', groupName);
                });

                // # Submit a post containing the group mention
                cy.postMessage(`@${groupName}`);

                // * Verify if a system message is displayed
                cy.getLastPostId().then((postId) => {
                    cy.get(`#postMessageText_${postId}`).should('include.text', `@${groupName} has no members on this team`);

                    // * Verify that the group mention is not highlighted
                    cy.get(`#postMessageText_${postId}`).find('.mention--highlight').should('not.exist');

                    // * Verify that the group mention has blue colored text
                    cy.get(`#postMessageText_${postId}`).find('.group-mention-link').should('be.visible');
                });
            });
        });
    });

    it('MM-T2452 - Group Mentions when user is a Guest User', () => {
        const groupName = `board_test_case_${Date.now()}`;

        // # Login as sysadmin and enable group mention with the group name
        cy.apiAdminLogin();
        enableGroupMention(groupName);

        // # Disable Group Mentions for All Users & Guest Users
        cy.visit('/admin_console/user_management/permissions/system_scheme');
        disablePermission('all_users-posts-use_group_mentions-checkbox');
        disablePermission('guests-guest_use_group_mentions-checkbox');
        saveConfig();

        // # Create a new channel as a sysadmin
        cy.apiCreateChannel(testTeam.id, 'group-mention', 'Group Mentions').then(({channel}) => {
            cy.apiCreateUser().then(({user}) => { // eslint-disable-line
                // # Add user to the team and channel
                cy.apiAddUserToTeam(testTeam.id, user.id).then(() => {
                    cy.apiAddUserToChannel(channel.id, user.id);
                });

                // # Demote the user as a guest user
                cy.apiDemoteUserToGuest(user.id);

                // # Login as a guest user
                cy.apiLogin(user);

                // # Visit the channel
                cy.visit(`/${testTeam.name}/channels/${channel.name}`);

                // # Type the Group Name
                cy.get('#post_textbox').should('be.visible').clear().type(`@${groupName}`).wait(TIMEOUTS.TWO_SEC);

                // * Verify if autocomplete dropdown is not displayed
                cy.get('#suggestionList').should('not.be.visible');

                // # Submit a post containing the group mention
                cy.postMessage(`@${groupName}`);

                // * Verify if a system message is not displayed
                cy.getLastPostId().then((postId) => {
                    cy.get(`#postMessageText_${postId}`).should('include.text', `@${groupName}`);

                    // * Verify that the group mention is not highlighted
                    cy.get(`#postMessageText_${postId}`).find('.mention--highlight').should('not.exist');

                    // * Verify that the group mention does not has blue colored text
                    cy.get(`#postMessageText_${postId}`).find('.group-mention-link').should('not.exist');
                });

                // # Login as sysadmin and enable group mentions permission for guests
                cy.apiAdminLogin();
                cy.visit('/admin_console/user_management/permissions/system_scheme');
                enablePermission('guests-guest_use_group_mentions-checkbox');
                saveConfig();

                // # Login as guest user again and visit the channel
                cy.apiLogin(user);
                cy.visit(`/${testTeam.name}/channels/${channel.name}`);

                // # Type the Group Name
                cy.get('#post_textbox').should('be.visible').clear().type(`@${groupName}`).wait(TIMEOUTS.TWO_SEC);

                // * Verify if autocomplete dropdown is displayed
                cy.get('#suggestionList').should('be.visible').children().within((el) => {
                    cy.wrap(el).eq(0).should('contain', 'Group Mentions');
                    cy.wrap(el).eq(1).should('contain', groupName);
                });

                // # Submit a post containing the group mention
                cy.postMessage(`@${groupName}`);

                // * Verify if a system message is displayed
                cy.getLastPostId().then((postId) => {
                    cy.get(`#postMessageText_${postId}`).should('include.text', `@${boardUser.username} did not get notified by this mention because they are not in the channel.`);

                    // * Verify that the option to add them to channel is not given
                    cy.get('a.PostBody_addChannelMemberLink').should('not.exist');
                });
            });
        });
    });

    function enableGroupMention(groupName) {
        // # Visit Group Configurations page
        cy.visit(`/admin_console/user_management/groups/${groupID}`);

        // # Scroll users list into view and then make sure it has loaded before scrolling back to the top
        cy.get('#group_users').scrollIntoView();
        cy.findByText(boardUser.email).should('be.visible');
        cy.get('#group_profile').scrollIntoView().wait(TIMEOUTS.TWO_SEC);

        // # Click the allow reference button
        cy.findByTestId('allowReferenceSwitch').then((el) => {
            const button = el.find('button');
            const classAttribute = button[0].getAttribute('class');
            if (!classAttribute.includes('active')) {
                button[0].click();
            }
        });

        // # Give the group a custom name different from its DisplayName attribute
        cy.get('#groupMention').find('input').clear().type(groupName);

        // # Click save button
        saveConfig();
    }

    function saveConfig() {
        cy.get('#saveSetting').then((btn) => {
            if (btn.is(':enabled')) {
                btn.click();

                cy.waitUntil(() => cy.get('#saveSetting').then((el) => {
                    return el[0].innerText === 'Save';
                }));
            }
        });
    }
});
