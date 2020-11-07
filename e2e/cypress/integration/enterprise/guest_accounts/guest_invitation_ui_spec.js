// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. #. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @guest_account

/**
 * Note: This test requires Enterprise license to be uploaded
 */
import {getRandomId} from '../../../utils';
import * as TIMEOUTS from '../../../fixtures/timeouts';

function changeGuestFeatureSettings(featureFlag = true, emailInvitation = true, whitelistedDomains = '') {
    // # Update Guest Accounts, Email Invitations, and Whitelisted Domains
    cy.apiUpdateConfig({
        GuestAccountsSettings: {
            Enable: featureFlag,
            RestrictCreationToDomains: whitelistedDomains,
        },
        ServiceSettings: {
            EnableEmailInvitations: emailInvitation,
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

function verifyInvitationError(user, team, errorText, verifyGuestBadge = false) {
    // * Verify the content and error message in the Invitation Modal
    cy.findByTestId('invitationModal').within(() => {
        cy.get('h1').should('have.text', `Guests Invited to ${team.display_name}`);
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

function verifyInvitationSuccess(user, team, successText, verifyGuestBadge = false) {
    // * Verify the content and success message in the Invitation Modal
    cy.findByTestId('invitationModal').within(() => {
        cy.get('h1').should('have.text', `Guests Invited to ${team.display_name}`);
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
    let testTeam;
    let newUser;
    let regularUser;

    before(() => {
        // * Check if server has license for Guest Accounts
        cy.apiRequireLicenseForFeature('GuestAccounts');
    });

    beforeEach(() => {
        // # Login as sysadmin
        cy.apiAdminLogin();

        // # Reset Guest Feature settings
        changeGuestFeatureSettings();

        cy.apiInitSetup().then(({team, user}) => {
            regularUser = user;
            testTeam = team;

            cy.apiCreateUser().then(({user: user1}) => {
                newUser = user1;
                cy.apiAddUserToTeam(testTeam.id, newUser.id);
            });

            // # Go to town square
            cy.visit(`/${team.name}/channels/town-square`);
        });
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
            cy.get('h1').should('have.text', `Invite Guests to ${testTeam.display_name}`);
        });

        // * Verify Invite Guests button is disabled by default
        cy.get('#inviteGuestButton').scrollIntoView().should('be.visible').and('be.disabled');

        // * Verify Invite People field
        const email = `temp-${getRandomId()}@mattermost.com`;
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
        cy.get('#confirmModalButton').should('be.visible').and('have.text', 'Yes, Discard').click().wait(TIMEOUTS.HALF_SEC);

        // * Verify it goes back to previous step since back button was pressed
        cy.findByTestId('inviteGuestLink').should('be.visible');
    });

    it('MM-18042 Verify Add New/Existing Guest Users', () => {
        // # Search and add an existing member by username who is part of the team
        invitePeople(newUser.username, 1, newUser.username);

        // * Verify the content and message in next screen
        verifyInvitationError(newUser.username, testTeam, 'This person is already a member.');

        // # Search and add an existing member by email who is not part of the team
        invitePeople(regularUser.email, 1, regularUser.username);

        // * Verify the content and message in next screen
        verifyInvitationError(regularUser.username, testTeam, 'This person is already a member.');

        // # Demote the user from member to guest
        cy.apiDemoteUserToGuest(newUser.id);

        // # Search and add an existing guest by first name, who is part of the team but not channel
        invitePeople(newUser.first_name, 1, newUser.username, 'Off-Topic');

        // * Verify the content and message in next screen
        verifyInvitationSuccess(newUser.username, testTeam, 'This guest has been added to the team and channel.');

        // # Search and add an existing guest by last name, who is part of the team and channel
        invitePeople(newUser.last_name, 1, newUser.username);

        // * Verify the content and message in next screen
        verifyInvitationError(newUser.username, testTeam, 'This person is already a member of all the channels.', true);

        // # Search and add an existing guest by email, who is not part of the team
        cy.apiCreateGuestUser().then(({guest}) => {
            invitePeople(guest.email, 1, guest.username);

            verifyInvitationSuccess(guest.username, testTeam, 'This guest has been added to the team and channel.', true);
        });

        // # Search and add a new guest by email, who is not part of the team
        const email = `temp-${getRandomId()}@mattermost.com`;
        invitePeople(email, 1, email);

        // * Verify the content and message in next screen
        verifyInvitationSuccess(email, testTeam, 'An invitation email has been sent.');
    });

    it('MM-18050 Verify when different feature settings are disabled', () => {
        // # Disable Guest Accounts
        // # Enable Email Invitations
        changeGuestFeatureSettings(false, true);

        // # reload current page
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Open Invite People
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#invitePeople').should('be.visible').click();

        // * Verify if Invite Members modal is displayed when guest account feature is disabled
        cy.findByTestId('invitationModal').find('h1').should('have.text', `Invite Members to ${testTeam.display_name}`);

        // * Verify Share Link Header and helper text
        cy.findByTestId('shareLink').should('be.visible').within(() => {
            cy.get('h2 > span').should('have.text', 'Share This Link');
            cy.get('.help-text > span').should('have.text', 'Share this link to invite people to this team.');
        });

        // # Close the Modal
        cy.get('#closeIcon').should('be.visible').click();

        // # Enable Guest Accounts
        // # Disable Email Invitations
        changeGuestFeatureSettings(true, false);

        // # Reload the current page
        cy.reload();

        const email = `temp-${getRandomId()}@mattermost.com`;
        invitePeople(email, 1, email, 'Town Square', false);

        // * Verify Invite Guests button is disabled
        cy.get('#inviteGuestButton').should('be.disabled');
    });

    it('MM-18047 Verify Guest User whitelisted domains', () => {
        // # Configure a whitelisted domain
        changeGuestFeatureSettings(true, true, 'example.com');

        // # Visit to newly created team
        cy.reload();
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Invite a Guest by email
        const email = `temp-${getRandomId()}@mattermost.com`;
        invitePeople(email, 1, email);

        // * Verify the content and message in next screen
        const expectedError = `The following email addresses do not belong to an accepted domain: ${email}. Please contact your System Administrator for details.`;
        verifyInvitationError(email, testTeam, expectedError);

        // # From System Console try to update email of guest user
        cy.apiCreateGuestUser().then(({guest}) => {
            // # Navigate to System Console Users listing page
            cy.visit('/admin_console/user_management/users');

            // # Search for User by username and select the option to update email
            cy.get('#searchUsers').should('be.visible').type(guest.username);

            // # Click on the option to update email
            cy.wait(TIMEOUTS.HALF_SEC);
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

    it('MM-22037 Invite Guest via Email containing upper case letters', () => {
        // # Reset Guest Feature settings
        changeGuestFeatureSettings();

        // # Visit Team page
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Invite a email containing uppercase letters
        const email = `tEMp-${getRandomId()}@mattermost.com`;
        invitePeople(email, 1, email);

        // * Verify the content and message in next screen
        verifyInvitationSuccess(email.toLowerCase(), testTeam, 'An invitation email has been sent.');
    });

    it('MM-T1414 Add Guest from Add New Members dialog', () => {
        // # Demote the user from member to guest
        cy.apiDemoteUserToGuest(newUser.id);

        // # Open Invite People
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#invitePeople').should('be.visible').click();

        // # Click on the next icon to invite members
        cy.findByTestId('inviteMembersLink').find('.arrow').click();

        // # Search and add a member
        cy.findByTestId('inputPlaceholder').should('be.visible').within(($el) => {
            cy.wrap($el).get('input').type(newUser.username, {force: true});
            cy.wrap($el).get('.users-emails-input__menu').
                children().should('have.length', 1).eq(0).should('contain', newUser.username).click();
        });

        // # Click Invite Members
        cy.get('#inviteMembersButton').scrollIntoView().click();

        // * Verify the content and error message in the Invitation Modal
        cy.findByTestId('invitationModal').within(() => {
            cy.get('h2.subtitle > span').should('have.text', '1 invitation was not sent');
            cy.get('div.invitation-modal-confirm-sent').should('not.exist');
            cy.get('div.invitation-modal-confirm-not-sent').should('be.visible').within(() => {
                cy.get('h2 > span').should('have.text', 'Invitations Not Sent');
                cy.get('.people-header').should('have.text', 'People');
                cy.get('.details-header').should('have.text', 'Details');
                cy.get('.username-or-icon').should('contain', newUser.username);
                cy.get('.reason').should('have.text', 'Contact your admin to make this guest a full member.');
                cy.get('.username-or-icon .Badge').should('be.visible').and('have.text', 'GUEST');
            });
        });
    });

    it('MM-T1415 Check Previous button on successful/failed invites', () => {
        // # Search and add an existing member by username who is part of the team
        invitePeople(newUser.username, 1, newUser.username);

        // * Verify the content and message in next screen
        cy.findByText('This person is already a member.').should('be.visible');

        // # Click on previous button
        cy.get('#backIcon').click();

        // * Verify the channel is preselected
        cy.findByTestId('channelPlaceholder').should('be.visible').within(() => {
            cy.get('.public-channel-icon').should('be.visible');
            cy.findByText('Town Square').should('be.visible');
        });

        // * Verify the email field is empty
        cy.findByTestId('emailPlaceholder').should('be.visible').within(() => {
            cy.get('.users-emails-input__multi-value').should('not.exist');
            const email = `temp-${getRandomId()}@mattermost.com`;
            cy.get('input').type(email, {force: true});
            cy.get('.users-emails-input__menu').children().should('have.length', 1).eq(0).should('contain', email).click();
        });

        // # Click Invite Guests Button
        cy.get('#inviteGuestButton').scrollIntoView().click();

        // * Verify previous button is not displayed
        cy.get('#backIcon').should('not.exist');
    });
});
