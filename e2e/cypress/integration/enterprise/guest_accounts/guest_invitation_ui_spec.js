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

function changeGuestFeatureSettings(featureFlag = true, emailInvitation = true) {
    // # Update Guest Account Settings
    cy.apiUpdateConfig({
        GuestAccountsSettings: {
            Enable: featureFlag,
        },
        ServiceSettings: {
            EnableEmailInvitations: emailInvitation,
        },
    });
}

function invitePeople(typeText, resultsCount, verifyText) {
    const channelName = 'Town Square';

    // # Open Invite People
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
    cy.get('#invitePeople').should('be.visible').click();

    // #Click on the next icon to invite guest
    cy.getByTestId('inviteGuestLink').find('.arrow').click();

    // # Search and add a user
    cy.getByTestId('emailPlaceholder').should('be.visible').within(($el) => {
        cy.wrap($el).get('input').type(typeText, {force: true});
        cy.wrap($el).get('.users-emails-input__menu').
            children().should('have.length', resultsCount).eq(0).should('contain', verifyText).click();
    });

    // # Search and add a Channel
    cy.getByTestId('channelPlaceholder').should('be.visible').within(($el) => {
        cy.wrap($el).get('input').type(channelName, {force: true});
        cy.wrap($el).get('.channels-input__menu').
            children().should('have.length', 1).
            eq(0).should('contain', channelName).click();
    });

    // # Click Invite Guests Button
    cy.get('#inviteGuestButton').scrollIntoView().click();
}

function verifyInvitationError(user, errorText, verifyGuestBadge = false) {
    // * Verify the content and error message in the Invitation Modal
    cy.getByTestId('invitationModal').within(($el) => {
        cy.wrap($el).find('h1').should('have.text', `Guests Invited to ${testTeam.display_name}`);
        cy.wrap($el).find('h2.subtitle > span').should('have.text', '1 invitation was not sent');
        cy.wrap($el).find('div.invitation-modal-confirm-sent').should('not.exist');
        cy.wrap($el).find('div.invitation-modal-confirm-not-sent').should('be.visible').within(($subel) => {
            cy.wrap($subel).find('h2 > span').should('have.text', 'Invitations Not Sent');
            cy.wrap($subel).find('.people-header').should('have.text', 'People');
            cy.wrap($subel).find('.details-header').should('have.text', 'Details');
            cy.wrap($subel).find('.username-or-icon').should('contain', user);
            cy.wrap($subel).find('.reason').should('have.text', errorText);
            if (verifyGuestBadge) {
                cy.wrap($subel).find('.username-or-icon .Badge').should('be.visible').and('have.text', 'GUEST');
            }
        });
        cy.wrap($el).find('.confirm-done > button').should('be.visible').and('not.be.disabled').click();
    });

    // * Verify if Invitation Modal was closed
    cy.get('.InvitationModal').should('not.exist');
}

function verifyInvitationSuccess(user, successText, verifyGuestBadge = false) {
    // * Verify the content and success message in the Invitation Modal
    cy.getByTestId('invitationModal').within(($el) => {
        cy.wrap($el).find('h1').should('have.text', `Guests Invited to ${testTeam.display_name}`);
        cy.wrap($el).find('h2.subtitle > span').should('have.text', '1 person has been invited');
        cy.wrap($el).find('div.invitation-modal-confirm-not-sent').should('not.exist');
        cy.wrap($el).find('div.invitation-modal-confirm-sent').should('be.visible').within(($subel) => {
            cy.wrap($subel).find('h2 > span').should('have.text', 'Successful Invites');
            cy.wrap($subel).find('.people-header').should('have.text', 'People');
            cy.wrap($subel).find('.details-header').should('have.text', 'Details');
            cy.wrap($subel).find('.username-or-icon').should('contain', user);
            cy.wrap($subel).find('.reason').should('have.text', successText);
            if (verifyGuestBadge) {
                cy.wrap($subel).find('.username-or-icon .Badge').should('be.visible').and('have.text', 'GUEST');
            }
        });
        cy.wrap($el).find('.confirm-done > button').should('be.visible').and('not.be.disabled').click();
    });

    // * Verify if Invitation Modal was closed
    cy.get('.InvitationModal').should('not.exist');
}

describe('Guest Account - Guest User Invitation Flow', () => {
    before(() => {
        // # Enable Guest Account Settings
        changeGuestFeatureSettings();

        // # Login as "sysadmin" and go to /
        cy.apiLogin('sysadmin');

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
        // # Delete the new team as sysadmin
        if (testTeam && testTeam.id) {
            cy.apiLogin('sysadmin');
            cy.apiDeleteTeam(testTeam.id);
        }
    });

    it('MM-18041 Verify UI Elements of Guest User Invitation Flow', () => {
        // #Open Invite People
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#invitePeople').should('be.visible').click();

        // *Verify Invite Guest link
        cy.getByTestId('inviteGuestLink').should('be.visible').within(($el) => {
            cy.wrap($el).find('h2 > span').should('have.text', 'Invite Guests');
            cy.wrap($el).find('div > span').should('have.text', 'Invite guests to one or more channels. Guests only have access to messages, files, and people in the channels they are members of.');
            cy.wrap($el).find('.arrow').click();
        });

        // * Verify the header has changed in the modal
        cy.getByTestId('invitationModal').within(($el) => {
            cy.wrap($el).find('h1').should('have.text', 'Invite Guests');
        });

        // *Verify Invite Guests button is disabled by default
        cy.get('#inviteGuestButton').scrollIntoView().should('be.visible').and('be.disabled');

        // *Verify Invite People field
        const email = `temp-${getRandomInt(9999).toString()}@mattermost.com`;
        cy.getByTestId('addPeople').should('be.visible').within(($el) => {
            cy.wrap($el).find('h2 > span').should('have.text', 'Invite People');
            cy.wrap($el).find('.help-text > span').should('have.text', 'Search and add guests or email invite new users.');
        });
        cy.getByTestId('emailPlaceholder').should('be.visible').within(($el) => {
            // * Verify the input placeholder text
            cy.wrap($el).get('.users-emails-input__placeholder').should('have.text', 'Add guests or email addresses');

            // # Type the email of the new user
            cy.wrap($el).get('input').type(email, {force: true});
            cy.wrap($el).get('.users-emails-input__menu').
                children().should('have.length', 1).
                eq(0).should('contain', `Invite ${email} as a guest`).click();
        });

        // *Verify Search and Add Channels
        cy.getByTestId('channelPlaceholder').should('be.visible').within(($el) => {
            cy.wrap($el).find('h2 > span').should('have.text', 'Search and Add Channels');
            cy.wrap($el).find('.help-text > span').should('have.text', 'Specify the channels the guests have access to.');
        });
        cy.getByTestId('channelPlaceholder').should('be.visible').within(($el) => {
            // * Verify the input placeholder text
            cy.wrap($el).get('.channels-input__placeholder').should('have.text', 'Search and add channels');

            // # Type the channel name
            cy.wrap($el).get('input').type('town sq', {force: true});
            cy.wrap($el).get('.channels-input__menu').
                children().should('have.length', 1).
                eq(0).should('contain', 'Town Square').click();
        });

        // *Verify Set Custom Message before clicking on the link
        cy.getByTestId('customMessage').should('be.visible').within(($el) => {
            cy.wrap($el).get('#customMessageHeader').should('not.exist');
            cy.wrap($el).get('textarea').should('not.exist');
            cy.wrap($el).get('.help-text').should('have.text', 'Create a custom message to make your invite more personal.');

            // #Verify link text and click on it
            cy.wrap($el).get('a').should('have.text', 'Set a custom message').click();
        });

        // *Verify Set Custom Message after clicking on the link
        cy.getByTestId('customMessage').should('be.visible').within(($el) => {
            cy.wrap($el).get('a').should('not.exist');
            cy.wrap($el).find('div > span').first().should('be.visible').and('have.text', 'Custom message');
            cy.wrap($el).get('textarea').should('be.visible');
            cy.wrap($el).get('.help-text').should('have.text', 'Create a custom message to make your invite more personal.');
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
        cy.getByTestId('inviteGuestLink').should('be.visible');
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
        invitePeople(newUser.firstName, 1, newUser.username);

        // * Verify the content and message in next screen
        verifyInvitationSuccess(newUser.username, 'This guest has been added to the team and channel.', true);

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
        const email = `temp-${getRandomInt(9999).toString()}@mattermost.com`;
        invitePeople(email, 1, email);

        // * Verify the content and message in next screen
        verifyInvitationSuccess(email, 'An invitation email has been sent.');
    });

    it('MM-18050 Verify when different feature settings are disabled', () => {
        // # Disable Guest Account Feature
        changeGuestFeatureSettings(false, true);

        // # Login again after changing feature flag and reload current page
        cy.apiLogin('sysadmin');
        cy.visit(`/${testTeam.name}`);

        // # Open Invite People
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#invitePeople').should('be.visible').click();

        // * Verify if Invite Members modal is displayed when guest account feature is disabled
        cy.getByTestId('invitationModal').within(($el) => {
            cy.wrap($el).find('h1').should('have.text', 'Invite Members');
        });

        // * Verify Share Link Header and helper text
        cy.getByTestId('shareLink').should('be.visible').within(($el) => {
            cy.wrap($el).find('h2 > span').should('have.text', 'Share This Link');
            cy.wrap($el).find('.help-text > span').should('have.text', 'Share this link to grant member access to this team.');
        });

        // # Close the Modal
        cy.get('#closeIcon').should('be.visible').click();

        // # Enable Guest Account Feature and disable Email Invitation
        changeGuestFeatureSettings(true, false);

        // # Login again after changing feature flag and reload current page
        cy.apiLogin('sysadmin');
        cy.visit(`/${testTeam.name}`);

        const email = `temp-${getRandomInt(9999).toString()}@mattermost.com`;
        invitePeople(email, 1, email);

        // * Verify the content and message in next screen
        verifyInvitationError(email, 'Error: Email invitations are disabled.');
    });
});
