// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import {channelUrl, setUserTeamAndChannelMemberships, enablePermission, removePermission, channelMentionsPermissionCheck, resetPermissionsToDefault} from './system_scheme_spec.js';

export const deleteExistingTeamOverrideSchemes = () => {
    cy.apiLogin('sysadmin');
    cy.apiGetSchemes('team').then((res) => {
        res.body.forEach((scheme) => {
            cy.apiDeleteScheme(scheme.id);
        });
    });
};

describe('Team Scheme Permissions Test', () => {
    before(() => {
        // * Check if server has license
        cy.requireLicense();

        // Reset permissions in system scheme to defaults.
        resetPermissionsToDefault();

        // Delete any existing team override schemes
        deleteExistingTeamOverrideSchemes();

        // # Visit the permissions page
        cy.visit('/admin_console/user_management/permissions');
    });

    it('MM-23018 - Create a team override scheme', () => {
        // # Visit the permissions page
        cy.visit('/admin_console/user_management/permissions/team_override_scheme');

        // # Give the new team scheme a name
        cy.get('#scheme-name').type('Test Team Scheme');

        // # Assign the new team scheme to the eligendi team using the add teams modal
        cy.findByTestId('add-teams').click();

        cy.get('#selectItems').type('eligendi');

        cy.get('.team-info-block').then((el) => {
            el.click();
        });

        cy.get('#saveItems').click();

        // # Save config
        cy.get('#saveSetting').click();

        // * Ensure that the team scheme was created and assigned to the team
        cy.findByTestId('permissions-scheme-summary').within(() => {
            cy.get('.permissions-scheme-summary--header').should('include.text', 'Test Team Scheme');
            cy.get('.permissions-scheme-summary--teams').should('include.text', 'eligendi');
        });
    });

    it('MM-23018 - Enable and Disable Channel Mentions for team scheme', () => {
        const permissionName = 'use_channel_mentions';

        // # Setup user as a regular channel member
        setUserTeamAndChannelMemberships();

        // * Ensure user can use channel mentions by default
        channelMentionsPermissionCheck(true);

        // # Login as sysadmin again
        cy.apiLogin('sysadmin');

        // # Get team scheme URL
        cy.apiGetSchemes('team').then((res) => {
            const teamScheme = res.body[0];
            const url = `admin_console/user_management/permissions/team_override_scheme/${teamScheme.id}`;

            // todo: add checks for guests once mattermost-webapp/pull/5061 is merged
            const usersTestId = `all_users-posts-${permissionName}-checkbox`;
            const channelTestId = `${teamScheme.default_channel_admin_role}-posts-${permissionName}-checkbox`;
            const teamTestId = `${teamScheme.default_team_admin_role}-posts-${permissionName}-checkbox`;
            const testIds = [usersTestId, channelTestId, teamTestId];

            // # Visit the scheme page
            cy.visit(url);

            // * Ensure permission is enabled at each scope by default
            testIds.forEach((testId) => {
                cy.findByTestId(testId).should('have.class', 'checked');
            });

            // # Remove permission from all users and save
            removePermission(usersTestId);
            cy.get('#saveSetting').click();
            cy.visit(url);

            // * Ensure that the permission is removed from all roles
            testIds.forEach((testId) => {
                cy.findByTestId(testId).should('not.have.class', 'checked');
            });

            // # Enable permission for team admins and save
            enablePermission(teamTestId);
            cy.get('#saveSetting').click();
            cy.visit(url);

            // * Ensure that the permission is removed from all roles except team admins
            cy.findByTestId(teamTestId).should('have.class', 'checked');
            cy.findByTestId(channelTestId).should('not.have.class', 'checked');
            cy.findByTestId(usersTestId).should('not.have.class', 'checked');

            // # Enable permission for channel admins and save
            enablePermission(channelTestId);
            cy.get('#saveSetting').click();
            cy.visit(url);

            // * Ensure that the permission is only removed from all users
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

            // # Navigate back to team scheme as sysadmin
            cy.apiLogin('sysadmin');
            cy.visit(url);

            // # Remove permission from channel admins and save
            removePermission(channelTestId);
            cy.get('#saveSetting').click();
            cy.visit(url);

            // # Log back in as regular user
            cy.apiLogin('user-1');
            cy.visit(channelUrl);

            // * Ensure user cannot use channel mentions as channel admin
            channelMentionsPermissionCheck(false);

            // # Setup user as a team admin
            setUserTeamAndChannelMemberships(true, true);

            // * Ensure user can use channel mentions as team admin
            channelMentionsPermissionCheck(true);

            // # Navigate back to system scheme as sysadmin
            cy.apiLogin('sysadmin');
            cy.visit(url);

            // # Remove permission from team admins and save
            removePermission(teamTestId);
            cy.get('#saveSetting').click();
            cy.visit(url);

            // # Log back in as regular user
            cy.apiLogin('user-1');
            cy.visit(channelUrl);

            // * Ensure user cannot use channel mentions as team admin
            channelMentionsPermissionCheck(false);
        });
    });
});
