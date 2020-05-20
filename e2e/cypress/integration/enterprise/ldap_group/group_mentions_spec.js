// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @ldap_group

import * as TIMEOUTS from '../../../fixtures/timeouts';
import users from '../../../fixtures/ldap_users.json';

let groupID;
let boardUser;

// Goes to the groups page for the group specified by id as sysadmin
const navigateToGroup = (id) => {
    // # Login as sysadmin and visit board group page, and wait until board user is visible
    cy.apiLogin('sysadmin');
    cy.visit(`/admin_console/user_management/groups/${id}`);

    // # Scroll users list into view and then make sure it has loaded before scrolling back to the top
    cy.get('#group_users').scrollIntoView();
    cy.findByText(boardUser.email).should('be.visible');
    cy.get('#group_profile').scrollIntoView();
};

// Goes to the ad-1 townsquare and attempts to display suggestions for the given group name
// Attempts to @mention the given group
// Checks to see that the group is not highlighted as a link when viewed by a user without permission to mention
// Checks to see that the group is not highlighted as a mention when viewed by user inside the group
const assertGroupMentionDisabled = (groupName) => {
    const suggestion = groupName.substring(0, groupName.length - 1);

    // # Visit ad-1 town-square
    cy.visit('/ad-1/channels/town-square');

    // # Type suggestion in channel post text box
    cy.get('#post_textbox').should('be.visible').clear().type(`@${suggestion}`).wait(TIMEOUTS.TINY);

    // * Should not open up suggestion list for groups
    cy.get('#suggestionList').should('not.be.visible');

    // # Type @groupName and post it to the channel
    cy.get('#post_textbox').clear().type(`@${groupName}{enter}{enter}`);

    // # Get last post message text
    cy.getLastPostId().then((postId) => {
        // * Assert that the last message posted contains the group name and is not highlighted with the class group-mention-link
        cy.get(`#postMessageText_${postId}`).find('.group-mention-link').should('not.be.visible');
        cy.get(`#postMessageText_${postId}`).should('include.text', `@${groupName}`);
    });

    // # Login as board user
    cy.apiLogin(boardUser.username, boardUser.password);

    // # Visit ad-1 town-square
    cy.visit('/ad-1/channels/town-square');

    // # Get last post message text
    cy.getLastPostId().then((postId) => {
        // * Assert that the last message posted contains the group name and is not highlighted with the class mention--highlight
        cy.get(`#postMessageText_${postId}`).find('.mention--highlight').should('not.be.visible');
        cy.get(`#postMessageText_${postId}`).should('include.text', `@${groupName}`);
    });
};

// Goes to the ad-1 townsquare and attempts to display suggestions for the given group name
// Attempts to @mention the given group
// Checks to see that the group is highlighted as a link when viewed by a user outside of the group
// Checks to see that the group is highlighted as a mention when viewed by user inside the group
const assertGroupMentionEnabled = (groupName) => {
    const suggestion = groupName.substring(0, groupName.length - 1);

    // # Visit ad-1 town-square
    cy.visit('/ad-1/channels/town-square');

    // # Type suggestion in channel post text box
    cy.get('#post_textbox').should('be.visible').clear().type(`@${suggestion}`).wait(TIMEOUTS.TINY);

    // * Should open up suggestion list for groups
    // * Should match group item and group label
    cy.get('#suggestionList').should('be.visible').children().within((el) => {
        cy.wrap(el).eq(0).should('contain', 'Group Mentions');
        cy.wrap(el).eq(1).should('contain', `@${groupName}`);
    });

    // # Type @groupName and post it to the channel
    cy.get('#post_textbox').clear().type(`@${groupName}{enter}{enter}`);

    // # Get last post message text
    cy.getLastPostId().then((postId) => {
        // * Assert that the last message posted contains the group name and is highlighted with the class group-mention-link
        cy.get(`#postMessageText_${postId}`).find('.group-mention-link').should('be.visible').should('include.text', `@${groupName}`);
    });

    // # Login as board user
    cy.apiLogin(boardUser.username, boardUser.password);

    // # Visit ad-1 town-square
    cy.visit('/ad-1/channels/town-square');

    // # Get last post message text
    cy.getLastPostId().then((postId) => {
        // * Assert that the last message posted contains the group name and is highlighted with the class mention--highlight
        cy.get(`#postMessageText_${postId}`).find('.mention--highlight').should('be.visible').should('include.text', `@${groupName}`);
    });
};

// Clicks the save button in the system console page.
const saveConfig = () => {
    // # Save if possible (if previous test ended abruptly all permissions may already be enabled)
    cy.get('#saveSetting').then((btn) => {
        if (btn.is(':enabled')) {
            btn.click();

            cy.waitUntil(() => cy.get('#saveSetting').then((el) => {
                return el[0].innerText === 'Save';
            }));
        }
    });
};

describe('System Console', () => {
    before(() => {
        // # Login as sysadmin
        cy.apiLogin('sysadmin');

        // * Check if server has license for LDAP Groups
        cy.requireLicenseForFeature('LDAPGroups');

        // # Enable LDAP
        cy.apiUpdateConfig({LdapSettings: {Enable: true}});

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
        boardUser = users['board-1'];
        cy.apiLogin(boardUser.username, boardUser.password);

        // # Login as sysadmin and add board-one to ad-1 team
        cy.apiLogin('sysadmin');

        // # Add board user to ad-1 to ensure that he exists in the team and set his preferences to skip tutorial step
        cy.apiGetUserByEmail(boardUser.email).then((eRes) => {
            const user = eRes.body;
            cy.apiGetTeamByName('ad-1').then((teamRes) => {
                cy.apiGetChannelByName('ad-1', 'town-square').then((channelRes) => {
                    const channelId = channelRes.body.id;
                    cy.apiAddUserToTeam(teamRes.body.id, user.id).then(() => {
                        cy.apiAddUserToChannel(channelId, user.id);
                    });
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

    it('MM-23937 - Can enable and disable group mentions with a custom name for a group ', () => {
        const groupName = `board_test_case_${Date.now()}`;

        // # Login as sysadmin and navigate to board group page
        navigateToGroup(groupID);

        // # Click the allow reference button
        cy.findByTestId('allowReferenceSwitch').then((el) => {
            el.find('button').click();
        });

        // # Give the group a custom name different from its DisplayName attribute
        cy.get('#groupMention').find('input').clear().type(groupName);

        // # Click save button
        saveConfig();

        // * Assert that the group mention works as expected since the group is enabled and sysadmin always has permission to mention
        assertGroupMentionEnabled(groupName);

        // # Login as sysadmin and navigate to board group page
        navigateToGroup(groupID);

        // # Click the allow reference button
        cy.findByTestId('allowReferenceSwitch').then((el) => {
            el.find('button').click();
        });

        // # Click save button
        saveConfig();

        // * Assert that the group mention does not do anything since the group is disabled even though sysadmin has permission to mention
        assertGroupMentionDisabled(groupName);
    });

    it('MM-23937 - Can restrict users from mentioning a group through the use_group_mentions permission', () => {
        const groupName = `board_test_case_${Date.now()}`;

        // # Login as sysadmin
        cy.apiLogin('sysadmin');

        // # Set group as allow reference = true with name groupName
        cy.apiPatchGroup(groupID, {allow_reference: true, name: groupName});

        // # Navigate to system scheme page
        cy.visit('/admin_console/user_management/permissions/system_scheme');

        // # Click reset to defaults, confirm and save
        cy.findByTestId('resetPermissionsToDefault').click();
        cy.get('#confirmModalButton').click();
        saveConfig();

        // # Login as a normal user
        cy.apiLogin('user-1');

        // * Assert that the group mention works as expected since the group is enabled and user has permission to mention
        assertGroupMentionEnabled(groupName);

        // # Login as sysadmin and navigate to system scheme
        cy.apiLogin('sysadmin');
        cy.visit('/admin_console/user_management/permissions/system_scheme');

        // # Disable group mentions for users if enabled and save
        cy.findByTestId('all_users-posts-use_group_mentions-checkbox').then((btn) => {
            if (btn.hasClass('checked')) {
                btn.click();
            }
        });
        saveConfig();

        // # Login as a regular member
        cy.apiLogin('user-1');

        // * Assert that the group mention does not do anything since the user does not have the permission to mention the group
        assertGroupMentionDisabled(groupName);
    });

    after(() => {
        // # Login as sysadmin and navigate to system scheme page
        cy.apiLogin('sysadmin');
        cy.visit('/admin_console/user_management/permissions/system_scheme');

        // # Click reset to defaults confirm and save
        cy.findByTestId('resetPermissionsToDefault').click();
        cy.get('#confirmModalButton').click();
        saveConfig();
    });
});
