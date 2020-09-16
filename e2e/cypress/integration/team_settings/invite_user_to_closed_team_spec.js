// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @team_settings

import {getRandomId} from '../../utils';
import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Team Settings', () => {
    let newUser;
    let isLicensed;

    before(() => {
        // # If the instance the test is running on is licensed, assign true to isLicensed variable
        cy.apiGetClientLicense().then(({license}) => {
            isLicensed = license.IsLicensed === 'true';
        });

        cy.apiInitSetup().then(({team}) => {
            cy.apiCreateUser().then(({user}) => {
                newUser = user;
            });

            cy.visit(`/${team.name}`);
        });
    });

    it('MM-T388 - Invite new user to closed team with "Allow only users with a specific email domain to join this team" set to "sample.mattermost.com" AND include a non-sample.mattermost.com email address in the invites', () => {
        const emailDomain = 'sample.mattermost.com';
        const invalidEmail = `user.${getRandomId()}@invalid.com`;
        const userDetailsString = `@${newUser.username} - ${newUser.first_name} ${newUser.last_name} (${newUser.nickname})`;
        const inviteSuccessMessage = 'This member has been added to the team.';
        const inviteFailedMessage = `The following email addresses do not belong to an accepted domain: ${invalidEmail}. Please contact your System Administrator for details.`;

        // Open 'Team Settings' modal
        cy.get('.sidebar-header-dropdown__icon').click();
        cy.findByText('Team Settings').should('be.visible').click();

        // * Check that the 'Team Settings' modal was opened
        cy.get('#teamSettingsModal').should('exist').within(() => {
            // # Click on the 'Allow only users with a specific email domain to join this team' edit button
            cy.get('#allowed_domainsEdit').should('be.visible').click();

            // # Set 'sample.mattermost.com' as the only allowed email domain and save
            cy.wait(TIMEOUTS.HALF_SEC);
            cy.focused().type(emailDomain);
            cy.findByText('Save').should('be.visible').click();

            // # Close the modal
            cy.get('#teamSettingsModalLabel').find('button').should('be.visible').click();
        });

        // # Open the 'Invite People' full screen modal
        cy.get('.sidebar-header-dropdown__icon').click();
        cy.get('#invitePeople').find('button').eq(0).click();

        // # Invite user with valid email domain that is not in the team
        inviteNewMemberToTeam(newUser.email);

        // * Assert that the user has successfully been invited to the team
        cy.get('.invitation-modal-confirm-sent').should('be.visible').within(() => {
            cy.get('.username-or-icon').find('span').eq(0).should('have.text', userDetailsString);
            cy.get('.InvitationModalConfirmStepRow').find('div').eq(1).should('have.text', inviteSuccessMessage);
        });

        // # Click on the 'Invite More People button'
        cy.get('.invite-more').click();

        // # Invite a user with an invalid email domain (not sample.mattermost.com)
        inviteNewMemberToTeam(invalidEmail);

        // * Assert that the invite failed and the correct error message is shown
        cy.get('.invitation-modal-confirm-not-sent').should('be.visible').within(() => {
            cy.get('.username-or-icon').find('span').eq(1).should('have.text', invalidEmail);
            cy.get('.InvitationModalConfirmStepRow').find('div').eq(1).should('have.text', inviteFailedMessage);
        });
    });

    function inviteNewMemberToTeam(email) {
        cy.wait(TIMEOUTS.HALF_SEC);
        if (isLicensed) {
            // # Click "Invite members"
            cy.findByTestId('inviteMembersLink').should('be.visible').click();
        }
        cy.findByRole('textbox', {name: 'Add or Invite People'}).type(email, {force: true}).wait(TIMEOUTS.HALF_SEC).type('{enter}');
        cy.get('#inviteMembersButton').click();
    }
});
