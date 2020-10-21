// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @system_console

import * as TIMEOUTS from '../../../../fixtures/timeouts';
import {
    promoteToChannelOrTeamAdmin,
} from '../channel_moderation/helpers.js';

// # Goes to the System Scheme page as System Admin
const goToAdminConsole = () => {
    cy.apiAdminLogin();
    cy.visit('/admin_console');
};

describe('System console', () => {
    before(() => {
        // * Check if server has license
        cy.apiRequireLicense();
    });

    it('MM-T1201 - Remove and re-add license - Permissions freeze in place when license is removed (and then re-added)', () => {
        const verifyCreatePublicChannel = (testTeam, testUserNonTeamAdmin, testUserTeamAdmin, channel) => {
            // * Login as system admin and go the channel we created earlier and expect the create public channel button is visible
            cy.apiAdminLogin();
            cy.visit(`/${testTeam.name}/channels/${channel.name}`);
            cy.get('#createPublicChannel', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
            cy.wait(TIMEOUTS.FIVE_SEC);

            // * Login as team admin and go the channel we created earlier and expect the create public channel button is visible
            cy.apiLogin(testUserTeamAdmin);
            cy.visit(`/${testTeam.name}/channels/${channel.name}`);
            cy.get('#createPublicChannel', {timeout: TIMEOUTS.ONE_MIN}).should('not.be.visible');
            cy.wait(TIMEOUTS.FIVE_SEC);

            // * Login as non-team admin and go the channel we created earlier and expect the create public channel button is not visible
            cy.apiLogin(testUserNonTeamAdmin);
            cy.visit(`/${testTeam.name}/channels/${channel.name}`);
            cy.get('#createPublicChannel', {timeout: TIMEOUTS.ONE_MIN}).should('not.be.visible');
            cy.wait(TIMEOUTS.FIVE_SEC);
        };

        const verifyRenamePrivateChannel = (testTeam, testUserNonTeamAdmin, testUserTeamAdmin, channel) => {
            // * Click drop down and ensure the channel rename is visible for a system admin
            cy.apiAdminLogin();
            cy.visit(`/${testTeam.name}/channels/${channel.name}`);
            cy.get('#channelHeaderDropdownIcon', {timeout: TIMEOUTS.TWO_MIN}).should('be.visible').click();
            cy.get('#channelRename').should('be.visible');

            cy.apiLogin(testUserTeamAdmin);
            cy.visit(`/${testTeam.name}/channels/${channel.name}`);

            // * Click drop down and ensure the channel rename is visible for a team admin
            cy.get('#channelHeaderDropdownIcon', {timeout: TIMEOUTS.TWO_MIN}).should('be.visible').click();
            cy.get('#channelRename').should('be.visible');

            cy.apiLogin(testUserNonTeamAdmin);
            cy.visit(`/${testTeam.name}/channels/${channel.name}`);

            // * Click drop down and ensure the channel rename is not visible for a non team admin
            cy.get('#channelHeaderDropdownIcon', {timeout: TIMEOUTS.TWO_MIN}).should('be.visible').click();
            cy.get('#channelRename').should('not.be.visible');
        };

        // # Go to admin console and set permissions as listed in the test
        goToAdminConsole();
        cy.visit('admin_console/user_management/permissions/system_scheme');
        cy.findByTestId('resetPermissionsToDefault').click();
        cy.get('#confirmModalButton').click();
        cy.findByTestId('all_users-public_channel-create_public_channel-checkbox').click();
        cy.findByTestId('all_users-private_channel-manage_private_channel_properties-checkbox').click();
        cy.findByTestId('team_admin-private_channel-manage_private_channel_properties-checkbox').click();
        cy.findByTestId('saveSetting').click();

        // # Create a user, this will be our non team admin user
        cy.apiInitSetup().then(({team, user, channel}) => {
            const testTeam = team;
            const testUserNonTeamAdmin = user;

            // # Make a new user, this will be our team admin
            cy.apiCreateUser().then(({user: newUser}) => {
                // # Add him to the test team
                cy.apiAddUserToTeam(testTeam.id, newUser.id).then(() => {
                    const testUserTeamAdmin = newUser;
                    promoteToChannelOrTeamAdmin(testUserTeamAdmin.id, testTeam.id, 'teams');

                    // * Verify Create public channel exists for certain users and not others
                    verifyCreatePublicChannel(testTeam, testUserNonTeamAdmin, testUserTeamAdmin, channel);

                    // # Login as a Admin and visit the channel
                    cy.apiAdminLogin();
                    cy.visit(`/${testTeam.name}/channels/${channel.name}`);

                    // # Click the channel header dropdown
                    cy.get('#channelHeaderDropdownIcon').click();

                    // * Channel convert to private should be visible and confirm
                    cy.get('#channelConvertToPrivate').should('be.visible').click();
                    cy.findByTestId('convertChannelConfirm').should('be.visible').click();

                    // * Verify rename private channel exists for certain users and not others
                    verifyRenamePrivateChannel(testTeam, testUserNonTeamAdmin, testUserTeamAdmin, channel);

                    // # Remove license
                    cy.apiAdminLogin();
                    cy.apiDeleteLicense();

                    // * Verify permissions are frozen in place

                    // * Verify Create public channel exists for certain users and not others (Results should be the same as above)
                    verifyCreatePublicChannel(testTeam, testUserNonTeamAdmin, testUserTeamAdmin, channel);

                    // * Verify rename private channel exists for certain users and not others (Results should be same as above)
                    verifyRenamePrivateChannel(testTeam, testUserNonTeamAdmin, testUserTeamAdmin, channel);
                });
            });
        });
    });
});
