// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. #. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/**
 * Note: This test requires Enterprise license to be uploaded
 */
import * as TIMEOUTS from '../../../fixtures/timeouts';

let guest;
let team1;
let team2;

function removeUserFromAllChannels(verifyAlert) {
    // # Remove the Guest user from all channels of a team as a sysadmin
    const channels = ['Town Square', 'Off-Topic'];

    // # Always click on the Town Square channel first
    cy.get('#sidebarItem_town-square').click({force: true});

    channels.forEach((channel) => {
        // # Remove the Guest User from channel
        cy.getCurrentChannelId().then((channelId) => {
            cy.removeUserFromChannel(channelId, guest.id);
        });

        // * Verify if guest user gets a message when the channel is removed. Does not appears when removed from last channel of the last team
        if (channel === 'Town Square' || verifyAlert) {
            cy.get('#removeFromChannelModalLabel').should('be.visible').and('have.text', `Removed from ${channel}`);
            cy.get('.modal-body').should('be.visible').and('have.text', `sysadmin removed you from ${channel}`);
            cy.get('#removedChannelBtn').should('be.visible').and('have.text', 'Okay').click().wait(TIMEOUTS.TINY);
        }
    });
}

describe('Guest Account - Guest User Removal Experience', () => {
    before(() => {
        // * Check if server has license for Guest Accounts
        cy.requireLicenseForFeature('GuestAccounts');

        // # Enable Guest Account Settings
        cy.apiUpdateConfig({
            GuestAccountsSettings: {
                Enable: true,
            },
        });

        // # Login as new user
        cy.loginAsNewUser().then((userResponse) => {
            guest = userResponse;
            cy.visit('/ad-1/channels/town-square');

            // # Get the Current Team Id
            cy.getCurrentTeamId().then((teamId) => {
                cy.apiGetTeam(teamId).then((response) => {
                    team1 = {id: teamId, name: response.body.name};
                });
            });

            // # Create new team and visit its URL
            cy.apiCreateTeam('test-team2', 'Test Team2').then((response) => {
                team2 = {id: response.body.id, name: response.body.name};
                cy.visit(`/${team2.name}`);
            });
        });
    });

    it('MM-18044 Verify behavior when Guest User is removed from channel', () => {
        // # Demote the current member to a guest user
        cy.demoteUser(guest.id);

        // * Verify team Sidebar is visible
        cy.get('#teamSidebarWrapper').should('be.visible');

        // # Remove User from all the channels of the team as a sysadmin
        removeUserFromAllChannels(true);

        // * Verify if user is automatically redirected to the other team
        cy.url().should('include', team1.name);

        // # Remove User from all the channels of the team as a sysadmin
        removeUserFromAllChannels(true);

        // * Verify team Sidebar is not present
        cy.get('#teamSidebarWrapper').should('not.exist');

        // # Remove User from all the channels of the team as a sysadmin
        removeUserFromAllChannels(false);

        // * Verify if the user is redirected to the Select Team page
        cy.url().should('include', '/select_team');
        cy.get('.signup__content').should('be.visible').and('have.text', 'Your guest account has no channels assigned. Please contact an administrator.');

        // # Login as sysadmin and navigate to channel
        cy.apiLogin('sysadmin');
        cy.reload().visit(`/${team2.name}/channels/town-square`);

        // * Verify if status is displayed indicating guest user is removed from the channel
        cy.getLastPost().
            should('contain', 'System').
            and('contain', `You and @${guest.username} joined the team.`).
            and('contain', `@${guest.username} was removed from the channel.`);
    });
});
