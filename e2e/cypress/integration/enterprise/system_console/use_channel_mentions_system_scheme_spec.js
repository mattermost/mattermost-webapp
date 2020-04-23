// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../../fixtures/users.json';

const channelUrl = '/ad-1/channels/suscipit-4';
const setUserTeamAndChannelMemberships = (channelAdmin = false, teamAdmin = false) => {
    cy.apiLogin('user-1');
    cy.visit(channelUrl);

    cy.apiGetMe().then((res) => {
        const userId = res.body.id;

        // # Set user as regular system user
        cy.externalRequest({user: users.sysadmin, method: 'put', path: `users/${userId}/roles`, data: {roles: 'system_user'}});

        // # Get team membership
        cy.getCurrentTeamId().then((teamId) => {
            cy.externalRequest({
                user: users.sysadmin,
                method: 'put',
                path: `teams/${teamId}/members/${userId}/schemeRoles`,
                data: {
                    scheme_user: true,
                    scheme_admin: teamAdmin,
                }
            });

            // # Reload page to ensure no cache or saved information
            cy.reload(true);
        });

        // # Get channel membership
        cy.getCurrentChannelId().then((channelId) => {
            cy.externalRequest({
                user: users.sysadmin,
                method: 'put',
                path: `channels/${channelId}/members/${userId}/schemeRoles`,
                data: {
                    scheme_user: true,
                    scheme_admin: channelAdmin,
                }
            });

            // # Reload page to ensure no cache or saved information
            cy.reload(true);
        });
    });
};

const saveConfig = () => {
    cy.get('#saveSetting').click();
    cy.waitUntil(() => cy.get('#saveSetting').then((el) => {
        return el[0].innerText === 'Save';
    }));
};

const deleteExistingTeamOverrideSchemes = () => {
    cy.apiLogin('sysadmin');
    cy.apiGetSchemes('team').then((res) => {
        res.body.forEach((scheme) => {
            cy.apiDeleteScheme(scheme.id);
        });
    });
};

const enablePermission = (permissionCheckBoxTestId) => {
    cy.findByTestId(permissionCheckBoxTestId).then((el) => {
        if (!el.hasClass('checked')) {
            el.click();
        }
    });
};

const removePermission = (permissionCheckBoxTestId) => {
    cy.findByTestId(permissionCheckBoxTestId).then((el) => {
        if (el.hasClass('checked')) {
            el.click();
        }
    });
};

// # Checks to see if user recieved a system message warning after using @here
// # If enabled is true assumes the user has the permission enabled and checks for no system message
const channelMentionsPermissionCheck = (enabled) => {
    // # Type @here and post it to the channel
    cy.get('#post_textbox').clear().type('@here{enter}');

    // # Wait for system message to appear
    cy.wait(500); // eslint-disable-line cypress/no-unnecessary-waiting

    // # Get last post message text
    cy.getLastPostId().then((postId) => {
        if (enabled) {
            // * Assert that the last message posted is not a system message informing us we are not allowed to use channel mentions
            cy.get(`#postMessageText_${postId}`).should('not.include.text', 'Channel notifications are disabled');
        } else {
            // * Assert that the last message posted is the system message informing us we are not allowed to use channel mentions
            cy.get(`#postMessageText_${postId}`).should('include.text', 'Channel notifications are disabled');
        }
    });
};

const resetPermissionsToDefault = () => {
    // # Login as sysadmin and navigate to system scheme page
    cy.apiLogin('sysadmin');
    cy.visit('/admin_console/user_management/permissions/system_scheme');

    // # Click reset to defaults and confirm
    cy.findByTestId('resetPermissionsToDefault').click();
    cy.get('#confirmModalButton').click();

    // # Save
    saveConfig();
};

describe('System Scheme Channel Mentions Permissions Test', () => {
    before(() => {
        // * Check if server has license
        cy.requireLicense();

        // Reset permissions in system scheme to defaults.
        resetPermissionsToDefault();

        deleteExistingTeamOverrideSchemes();
    });

    it('MM-23018 - Enable and Disable Channel Mentions', () => {
        const permissionName = 'use_channel_mentions';
        const guestsTestId = `guests-${permissionName}-checkbox`;
        const usersTestId = `all_users-posts-${permissionName}-checkbox`;
        const channelTestId = `channel_admin-posts-${permissionName}-checkbox`;
        const teamTestId = `team_admin-posts-${permissionName}-checkbox`;
        const testIds = [guestsTestId, usersTestId, channelTestId, teamTestId];

        // # Setup user as a regular channel member and team member
        setUserTeamAndChannelMemberships();

        // * Ensure user can use channel mentions by default
        channelMentionsPermissionCheck(true);

        // # Go to system permissions scheme page as sysadmin
        cy.apiLogin('sysadmin');
        cy.visit('/admin_console/user_management/permissions/system_scheme');

        // * Ensure permission is enabled at each scope by default
        testIds.forEach((testId) => {
            cy.findByTestId(testId).should('have.class', 'checked');
        });

        // # Remove permission from guests and save
        removePermission(guestsTestId);
        saveConfig();

        // * Ensure that the permission removed is now removed
        cy.findByTestId(guestsTestId).should('not.have.class', 'checked');

        // # Remove permission from all users and save
        removePermission(usersTestId);
        saveConfig();

        // * Ensure that the permission is not removed from all roles except All Members
        cy.findByTestId(usersTestId).should('not.have.class', 'checked');
        cy.findByTestId(channelTestId).should('have.class', 'checked');
        cy.findByTestId(teamTestId).should('have.class', 'checked');

        // # Remove permission for channel admins and save
        removePermission(channelTestId);
        saveConfig();

        // * Ensure that the permission is removed from all roles except team admins
        cy.findByTestId(teamTestId).should('have.class', 'checked');
        cy.findByTestId(channelTestId).should('not.have.class', 'checked');
        cy.findByTestId(usersTestId).should('not.have.class', 'checked');

        // # Enable permission for channel admins and save
        enablePermission(channelTestId);
        saveConfig();

        // * Ensure that the permission is only removed from regular users
        cy.findByTestId(teamTestId).should('have.class', 'checked');
        cy.findByTestId(channelTestId).should('have.class', 'checked');
        cy.findByTestId(usersTestId).should('not.have.class', 'checked');

        // # Setup user as a regular channel member
        setUserTeamAndChannelMemberships();

        // * Ensure user cannot use channel mentions
        channelMentionsPermissionCheck(false);

        // # Setup user as a channel admin
        setUserTeamAndChannelMemberships(true, false);

        // * Ensure user can use channel mentions as channel admin
        channelMentionsPermissionCheck(true);

        // # Navigate back to system scheme as sysadmin and remove permission from channel admins
        cy.apiLogin('sysadmin');
        cy.visit('/admin_console/user_management/permissions/system_scheme');
        removePermission(channelTestId);
        saveConfig();

        // # Log back in as regular user
        cy.apiLogin('user-1');
        cy.visit(channelUrl);

        // * Ensure user cannot use channel mentions as channel admin
        channelMentionsPermissionCheck(false);

        // # Setup user as a team admin
        setUserTeamAndChannelMemberships(true, true);

        // * Ensure user can use channel mentions as team admin
        channelMentionsPermissionCheck(true);

        // # Navigate back to system scheme as sysadmin and remove permission from team admins
        cy.apiLogin('sysadmin');
        cy.visit('/admin_console/user_management/permissions/system_scheme');
        removePermission(teamTestId);
        saveConfig();

        // # Log back in as regular user
        cy.apiLogin('user-1');
        cy.visit(channelUrl);

        // * Ensure user cannot use channel mentions as team admin
        channelMentionsPermissionCheck(false);

        // # Reset permissions back to defaults
        resetPermissionsToDefault();
    });
});
