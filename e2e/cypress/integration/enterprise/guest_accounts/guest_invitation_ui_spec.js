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
import {getRandomInt} from '../../../utils';
import * as TIMEOUTS from '../../../fixtures/timeouts';
import users from '../../../fixtures/users.json';

let testTeam;
let newUser;
const user1 = users['user-1'];

function changeGuestFeatureSettings(featureFlag = true, emailInvitation = true, whitelistedDomains = '') {
    // # Update Guest Account Settings
    cy.apiUpdateConfigBasic({
        GuestAccountsSettings: {
            Enable: featureFlag,
            RestrictCreationToDomains: whitelistedDomains,
        },
        ServiceSettings: {
            EnableEmailInvitations: emailInvitation,
            IdleTimeout: 300,
        },
    });
}

function invitePeople(typeText, resultsCount, verifyText, channelName = 'Town Square', clickInvite = true) {
    // # Open Invite People
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
    cy.get('#invitePeople').should('be.visible').click();

    // # Click on the next icon to invite guest
    cy.findByTestId('inviteGuestLink').find('.arrow').click();

    // # Search and add a user
    cy.findByTestId('emailPlaceholder').should('be.visible').within(() => {
        cy.get('input').type(typeText, {force: true});
        cy.get('.users-emails-input__menu').
            children().should('have.length', resultsCount).eq(0).should('contain', verifyText).click();
    });

    // # Search and add a Channel
    cy.findByTestId('channelPlaceholder').should('be.visible').within(() => {
        cy.get('input').type(channelName, {force: true});
        cy.get('.channels-input__menu').
            children().should('have.length', 1).
            eq(0).should('contain', channelName).click();
    });

    if (clickInvite) {
        // # Click Invite Guests Button
        cy.get('#inviteGuestButton').scrollIntoView().click();
    }
}

function verifyInvitationError(user, errorText, verifyGuestBadge = false) {
    // * Verify the content and error message in the Invitation Modal
    cy.findByTestId('invitationModal').within(() => {
        cy.get('h1').should('have.text', `Guests Invited to ${testTeam.display_name}`);
        cy.get('h2.subtitle > span').should('have.text', '1 invitation was not sent');
        cy.get('div.invitation-modal-confirm-sent').should('not.exist');
        cy.get('div.invitation-modal-confirm-not-sent').should('be.visible').within(() => {
            cy.get('h2 > span').should('have.text', 'Invitations Not Sent');
            cy.get('.people-header').should('have.text', 'People');
            cy.get('.details-header').should('have.text', 'Details');
            cy.get('.username-or-icon').should('contain', user);
            cy.get('.reason').should('have.text', errorText);
            if (verifyGuestBadge) {
                cy.get('.username-or-icon .Badge').should('be.visible').and('have.text', 'GUEST');
            }
        });
        cy.get('.confirm-done').should('be.visible').and('not.be.disabled').click();
    });

    // * Verify if Invitation Modal was closed
    cy.get('.InvitationModal').should('not.exist');
}

function verifyInvitationSuccess(user, successText, verifyGuestBadge = false) {
    // * Verify the content and success message in the Invitation Modal
    cy.findByTestId('invitationModal').within(() => {
        cy.get('h1').should('have.text', `Guests Invited to ${testTeam.display_name}`);
        cy.get('h2.subtitle > span').should('have.text', '1 person has been invited');
        cy.get('div.invitation-modal-confirm-not-sent').should('not.exist');
        cy.get('div.invitation-modal-confirm-sent').should('be.visible').within(() => {
            cy.get('h2 > span').should('have.text', 'Successful Invites');
            cy.get('.people-header').should('have.text', 'People');
            cy.get('.details-header').should('have.text', 'Details');
            cy.get('.username-or-icon').should('contain', user);
            cy.get('.reason').should('have.text', successText);
            if (verifyGuestBadge) {
                cy.get('.username-or-icon .Badge').should('be.visible').and('have.text', 'GUEST');
            }
        });
        cy.get('.confirm-done').should('be.visible').and('not.be.disabled').click();
    });

    // * Verify if Invitation Modal was closed
    cy.get('.InvitationModal').should('not.exist');
}

describe('Guest Account - Guest User Invitation Flow', () => {
    before(() => {
        // # Login as "sysadmin"
        cy.apiLogin('sysadmin');

        // # Enable Guest Account Settings
        changeGuestFeatureSettings();

        // # Create new team and visit its URL
        cy.apiCreateTeam('test-team', 'Test Team').then((response) => {
            testTeam = response.body;

            // # Create a new user and add it to the new team
            cy.createNewUser().then((user) => {
                newUser = user;
                cy.apiAddUserToTeam(testTeam.id, user.id);
            });

            cy.visit(`/${testTeam.name}`);
        });
    });

    afterEach(() => {
        // # Reload current page after each test to close any popup/modals left open
        cy.reload();
    });

    after(() => {
        // # Reset Guest Feature settings
        changeGuestFeatureSettings();

        // # Delete the new team as sysadmin
        if (testTeam && testTeam.id) {
            cy.apiDeleteTeam(testTeam.id);
        }
    });

    it('MM-18041 Verify UI Elements of Guest User Invitation Flow', () => {
        // # Open Invite People
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#invitePeople').should('be.visible').click();

        // * Verify Invite Guest link
        cy.findByTestId('inviteGuestLink').should('be.visible').within(() => {
            cy.get('h2 > span').should('have.text', 'Invite Guests');
            cy.get('div > span').should('have.text', 'Invite guests to one or more channels. Guests only have access to messages, files, and people in the channels they are members of.');
            cy.get('.arrow').click();
        });

        // * Verify the header has changed in the modal
        cy.findByTestId('invitationModal').within(() => {
            cy.get('h1').should('have.text', 'Invite Guests to Test Team');
        });

        // * Verify Invite Guests button is disabled by default
        cy.get('#inviteGuestButton').scrollIntoView().should('be.visible').and('be.disabled');

        // * Verify Invite People field
        const email = `temp-${getRandomInt(9999)}@mattermost.com`;
        cy.findByTestId('addPeople').should('be.visible').within(() => {
            cy.get('h2 > span').should('have.text', 'Invite People');
            cy.get('.help-text > span').should('have.text', 'Add existing guests or send email invites to new guests.');
        });
        cy.findByTestId('emailPlaceholder').should('be.visible').within(() => {
            // * Verify the input placeholder text
            cy.get('.users-emails-input__placeholder').should('have.text', 'Add guests or email addresses');

            // # Type the email of the new user
            cy.get('input').type(email, {force: true});
            cy.get('.users-emails-input__menu').
                children().should('have.length', 1).
                eq(0).should('contain', `Invite ${email} as a guest`).click();
        });

        // * Verify Search and Add Channels
        cy.findByTestId('channelPlaceholder').should('be.visible').within(() => {
            cy.get('h2 > span').should('have.text', 'Search and Add Channels');
            cy.get('.help-text > span').should('have.text', 'Specify the channels the guests have access to.');
        });
        cy.findByTestId('channelPlaceholder').should('be.visible').within(() => {
            // * Verify the input placeholder text
            cy.get('.channels-input__placeholder').should('have.text', 'Search and add channels');

            // # Type the channel name
            cy.get('input').type('town sq', {force: true});
            cy.get('.channels-input__menu').
                children().should('have.length', 1).
                eq(0).should('contain', 'Town Square').click();
        });

        // * Verify Set Custom Message before clicking on the link
        cy.findByTestId('customMessage').should('be.visible').within(() => {
            cy.get('#customMessageHeader').should('not.exist');
            cy.get('textarea').should('not.exist');
            cy.get('.help-text').should('have.text', 'Create a custom message to make your invite more personal.');

            // #Verify link text and click on it
            cy.get('a').should('have.text', 'Set a custom message').click();
        });

        // * Verify Set Custom Message after clicking on the link
        cy.findByTestId('customMessage').should('be.visible').within(() => {
            cy.get('a').should('not.exist');
            cy.get('div > span').first().should('be.visible').and('have.text', 'Custom message');
            cy.get('textarea').should('be.visible');
            cy.get('.help-text').should('have.text', 'Create a custom message to make your invite more personal.');
        });

        // * Verify the confirmation message when users clicks on the Close button
        cy.get('#closeIcon').should('be.visible').click();
        cy.get('#confirmModalLabel').should('be.visible').and('have.text', 'Discard Changes');
        cy.get('.modal-body').should('be.visible').and('have.text', 'You have unsent invitations, are you sure you want to discard them?');

        // * Verify the behavior when Cancel button in the confirmation message is clicked
        cy.get('#cancelModalButton').click();
        cy.get('#confirmModal').should('not.exist');

        // * Verify the confirmation message when users clicks on the Previous button
        cy.get('#backIcon').should('be.visible').click();
        cy.get('#confirmModalLabel').should('be.visible').and('have.text', 'Discard Changes');
        cy.get('.modal-body').should('be.visible').and('have.text', 'You have unsent invitations, are you sure you want to discard them?');

        // * Verify the behavior when Yes, Discard button in the confirmation message is clicked
        cy.get('#confirmModalButton').should('be.visible').and('have.text', 'Yes, Discard').click().wait(TIMEOUTS.TINY);

        // * Verify it goes back to previous step since back button was pressed
        cy.findByTestId('inviteGuestLink').should('be.visible');
    });

    it('MM-18042 Verify Add New/Existing Guest Users', () => {
        // # Search and add an existing member by username who is part of the team
        invitePeople(newUser.username, 1, newUser.username);

        // * Verify the content and message in next screen
        verifyInvitationError(newUser.username, 'This person is already a member.');

        // # Search and add an existing member by email who is not part of the team
        invitePeople(user1.email, 1, user1.username);

        // * Verify the content and message in next screen
        verifyInvitationError(user1.username, 'This person is already a member.');

        // # Demote the user from member to guest
        cy.demoteUser(newUser.id);

        // # Search and add an existing guest by first name, who is part of the team but not channel
        invitePeople(newUser.firstName, 1, newUser.username, 'Off-Topic');

        // * Verify the content and message in next screen
        verifyInvitationSuccess(newUser.username, 'This guest has been added to the team and channel.');

        // # Search and add an existing guest by last name, who is part of the team and channel
        invitePeople(newUser.lastName, 1, newUser.username);

        // * Verify the content and message in next screen
        verifyInvitationError(newUser.username, 'This person is already a member of all the channels.', true);

        // # Search and add an existing guest by email, who is not part of the team
        cy.createNewUser().then((user) => {
            // # Demote the user from member to guest
            cy.demoteUser(user.id);

            invitePeople(user.email, 1, user.username);

            verifyInvitationSuccess(user.username, 'This guest has been added to the team and channel.', true);
        });

        // # Search and add a new guest by email, who is not part of the team
        const email = `temp-${getRandomInt(9999)}@mattermost.com`;
        invitePeople(email, 1, email);

        // * Verify the content and message in next screen
        verifyInvitationSuccess(email, 'An invitation email has been sent.');
    });

    it('MM-18050 Verify when different feature settings are disabled', () => {
        // # Login as sysadmin
        cy.apiLogin('sysadmin');

        // # Disable Guest Account Feature
        changeGuestFeatureSettings(false, true);

        // # reload current page
        cy.visit(`/${testTeam.name}`);

        // # Open Invite People
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#invitePeople').should('be.visible').click();

        // * Verify if Invite Members modal is displayed when guest account feature is disabled
        cy.findByTestId('invitationModal').find('h1').should('have.text', 'Invite Members to Test Team');

        // * Verify Share Link Header and helper text
        cy.findByTestId('shareLink').should('be.visible').within(() => {
            cy.get('h2 > span').should('have.text', 'Share This Link');
            cy.get('.help-text > span').should('have.text', 'Share this link to invite people to this team.');
        });

        // # Close the Modal
        cy.get('#closeIcon').should('be.visible').click();

        // # Enable Guest Account Feature and disable Email Invitation
        changeGuestFeatureSettings(true, false);

        // # Reload the current page
        cy.reload();

        const email = `temp-${getRandomInt(9999)}@mattermost.com`;
        invitePeople(email, 1, email, 'Town Square', false);

        // * Verify Invite Guests button is disabled
        cy.get('#inviteGuestButton').should('be.disabled');
    });

    it('MM-18047 Verify Guest User whitelisted domains', () => {
        // # Login as sysadmin
        cy.apiLogin('sysadmin');

        // # Configure a whitelisted domain
        changeGuestFeatureSettings(true, true, 'example.com');

        // # Visit to newly created team
        cy.reload();
        cy.visit(`/${testTeam.name}`);

        // # Invite a Guest by email
        const email = `temp-${getRandomInt(9999)}@mattermost.com`;
        invitePeople(email, 1, email);

        // * Verify the content and message in next screen
        const expectedError = `The following email addresses do not belong to an accepted domain: ${email}. Please contact your System Administrator for details.`;
        verifyInvitationError(email, expectedError);

        // # From System Console try to update email of guest user
        cy.createNewUser().then((user) => {
            // # Demote the user from member to guest
            cy.demoteUser(user.id);

            // # Navigate to System Console Users listing page
            cy.visit('/admin_console/user_management/users');

            // # Search for User by username and select the option to update email
            cy.get('#searchUsers').should('be.visible').type(user.username);

            // # Click on the option to update email
            cy.wait(TIMEOUTS.TINY);
            cy.findByTestId('userListRow').find('.MenuWrapper a').should('be.visible').click();
            cy.findByText('Update Email').should('be.visible').click();

            // * Update email outside whitelisted domain and verify error message
            cy.findByTestId('resetEmailModal').should('be.visible').within(() => {
                cy.findByTestId('resetEmailForm').should('be.visible').get('input').type(email);
                cy.findByTestId('resetEmailButton').click();
                cy.get('.error').should('be.visible').and('have.text', 'The email you provided does not belong to an accepted domain for guest accounts. Please contact your administrator or sign up with a different email.');
                cy.get('.close').click();
            });
        });
    });
});
