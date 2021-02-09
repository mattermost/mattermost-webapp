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

import {
    changeGuestFeatureSettings,
    invitePeople,
    verifyInvitationSuccess,
} from './helpers';

describe('Guest Account - Guest User Invitation Flow', () => {
    let testTeam;
    let newUser;

    before(() => {
        // * Check if server has license for Guest Accounts
        cy.apiRequireLicenseForFeature('GuestAccounts');
    });

    beforeEach(() => {
        // # Login as sysadmin
        cy.apiAdminLogin();

        // # Reset Guest Feature settings
        changeGuestFeatureSettings();

        cy.apiInitSetup().then(({team}) => {
            testTeam = team;

            cy.apiCreateUser().then(({user}) => {
                newUser = user;
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
