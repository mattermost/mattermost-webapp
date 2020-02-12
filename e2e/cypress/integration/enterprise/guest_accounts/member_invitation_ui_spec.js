// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/**
 * Note: This test requires Enterprise license to be uploaded
 */
import {getRandomInt} from '../../../utils';
import users from '../../../fixtures/users.json';

let testTeam;
const user1 = users['user-1'];
const sysadmin = users.sysadmin;

function invitePeople(typeText, resultsCount, verifyText) {
    // # Open Invite People
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
    cy.get('#invitePeople').should('be.visible').click();

    // # Search and add a member
    cy.findByTestId('inputPlaceholder').should('be.visible').within(($el) => {
        cy.wrap($el).get('input').type(typeText, {force: true});
        cy.wrap($el).get('.users-emails-input__menu').
            children().should('have.length', resultsCount).eq(0).should('contain', verifyText).click();
    });

    // # Click Invite Members
    cy.get('#inviteMembersButton').scrollIntoView().click();
}

function verifyInvitationError(user, errorText) {
    // * Verify the content and error message in the Invitation Modal
    cy.findByTestId('invitationModal').within(($el) => {
        cy.wrap($el).find('h1').should('have.text', `Members Invited to ${testTeam.display_name}`);
        cy.wrap($el).find('h2.subtitle > span').should('have.text', '1 invitation was not sent');
        cy.wrap($el).find('div.invitation-modal-confirm-sent').should('not.exist');
        cy.wrap($el).find('div.invitation-modal-confirm-not-sent').should('be.visible').within(($subel) => {
            cy.wrap($subel).find('h2 > span').should('have.text', 'Invitations Not Sent');
            cy.wrap($subel).find('.people-header').should('have.text', 'People');
            cy.wrap($subel).find('.details-header').should('have.text', 'Details');
            cy.wrap($subel).find('.username-or-icon').should('contain', user);
            cy.wrap($subel).find('.reason').should('have.text', errorText);
        });
        cy.wrap($el).find('.confirm-done').should('be.visible').and('not.be.disabled').click();
    });

    // * Verify if Invitation Modal was closed
    cy.get('.InvitationModal').should('not.exist');
}

function verifyInvitationSuccess(user, successText) {
    // * Verify the content and success message in the Invitation Modal
    cy.findByTestId('invitationModal').within(($el) => {
        cy.wrap($el).find('h1').should('have.text', `Members Invited to ${testTeam.display_name}`);
        cy.wrap($el).find('h2.subtitle > span').should('have.text', '1 person has been invited');
        cy.wrap($el).find('div.invitation-modal-confirm-not-sent').should('not.exist');
        cy.wrap($el).find('div.invitation-modal-confirm-sent').should('be.visible').within(($subel) => {
            cy.wrap($subel).find('h2 > span').should('have.text', 'Successful Invites');
            cy.wrap($subel).find('.people-header').should('have.text', 'People');
            cy.wrap($subel).find('.details-header').should('have.text', 'Details');
            cy.wrap($subel).find('.username-or-icon').should('contain', user);
            cy.wrap($subel).find('.reason').should('have.text', successText);
        });
        cy.wrap($el).find('.confirm-done').should('be.visible').and('not.be.disabled').click();
    });

    // * Verify if Invitation Modal was closed
    cy.get('.InvitationModal').should('not.exist');
}

describe('Guest Account - Member Invitation Flow', () => {
    before(() => {
        // # Login as "sysadmin" and go to /
        cy.apiLogin('sysadmin');

        // # Enable Guest Account Settings
        cy.apiUpdateConfigBasic({
            GuestAccountsSettings: {
                Enable: true,
            },
            ServiceSettings: {
                EnableEmailInvitations: true,
                IdleTimeout: 300,
            },
        });

        // # Create new team and visit its URL
        cy.apiCreateTeam('test-team', 'Test Team').then((response) => {
            testTeam = response.body;
            cy.visit('/');
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

    it('MM-18039 Verify UI Elements of Members Invitation Flow', () => {
        const email = `temp-${getRandomInt(9999).toString()}@mattermost.com`;

        // # Open Invite People
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#invitePeople').should('be.visible').click();

        // * Verify UI Elements in initial step
        cy.findByTestId('invitationModal').within(($el) => {
            cy.wrap($el).find('h1').should('have.text', `Invite people to ${testTeam.display_name}`);
        });
        cy.findByTestId('inviteMembersLink').should('be.visible').within(($el) => {
            cy.wrap($el).findByTestId('inviteMembersSection').find('h2 > span').should('have.text', 'Invite Members');
            cy.wrap($el).findByTestId('inviteMembersSection').find('span').last().should('have.text', 'Invite new team members with a link or by email. Team members have access to messages and files in open teams and public channels.');
            cy.wrap($el).find('.arrow').click();
        });

        // * Verify the header has changed in the modal
        cy.findByTestId('invitationModal').within(($el) => {
            cy.wrap($el).find('h1').should('have.text', 'Invite Members to Test Team');
        });

        // * Verify Share Link Header and helper text
        cy.findByTestId('shareLink').should('be.visible').within(($el) => {
            cy.wrap($el).find('h2 > span').should('have.text', 'Share This Link');
            cy.wrap($el).find('.help-text > span').should('have.text', 'Share this link to invite people to this team.');
        });

        // * Verify Share Link Input field
        const baseUrl = Cypress.config('baseUrl');
        cy.getCurrentTeamId().then((teamId) => {
            cy.apiGetTeam(teamId).then((response) => {
                const inviteId = response.body.invite_id;
                cy.findByTestId('shareLinkInput').should('be.visible').and('have.value', `${baseUrl}/signup_user_complete/?id=${inviteId}`);
            });
        });

        // * Verify Copy Link button text
        cy.findByTestId('shareLinkInputButton').should('be.visible').and('have.text', 'Copy Link');

        // * Verify Invite People field
        cy.findByTestId('searchAdd').should('be.visible').within(($el) => {
            cy.wrap($el).find('h2 > span').should('have.text', 'Add or Invite People');
            cy.wrap($el).find('.help-text > span').should('have.text', 'Add existing members or send email invites to new members.');
        });
        cy.get('#inviteMembersButton').scrollIntoView().should('be.visible').and('be.disabled');
        cy.findByTestId('inputPlaceholder').should('be.visible').within(($el) => {
            // * Verify the input placeholder text
            cy.wrap($el).get('.users-emails-input__placeholder').should('have.text', 'Add members or email addresses');

            // # Type the email of the new user
            cy.wrap($el).get('input').type(email, {force: true});
            cy.wrap($el).get('.users-emails-input__menu').
                children().should('have.length', 1).
                eq(0).should('contain', `Invite ${email} as a team member`).click();
        });

        // * Verify if invite members button is not disabled when an email is added
        cy.get('#inviteMembersButton').scrollIntoView().should('be.visible').and('not.be.disabled');

        // * Verify the confirmation message when users clicks on the Close button
        cy.get('#closeIcon').should('be.visible').click();
        cy.get('#confirmModalLabel').should('be.visible').and('have.text', 'Discard Changes');
        cy.get('.modal-body').should('be.visible').and('have.text', 'You have unsent invitations, are you sure you want to discard them?');

        // * Verify the behavior when Cancel button in the confirmation message is clicked
        cy.get('#cancelModalButton').click();
        cy.get('#confirmModal').should('not.exist');

        // * Verify the behavior when Yes, Discard button in the confirmation message is clicked
        cy.get('#closeIcon').should('be.visible').click();
        cy.get('#confirmModalButton').should('be.visible').and('have.text', 'Yes, Discard').click();
        cy.get('.InvitationModal').should('not.exist');
    });

    it('MM-18040 Verify Invite New/Existing Users', () => {
        // # Login as new user and get the user id
        cy.createNewUser().then((newUser) => {
            cy.apiAddUserToTeam(testTeam.id, newUser.id);
            cy.apiLogin(newUser.username, newUser.password);
            cy.visit('/');
            cy.visit(`/${testTeam.name}`);
        });

        // # Search and add an existing member by username who is part of the team
        invitePeople(sysadmin.username, 1, sysadmin.username);

        // * Verify the content and message in next screen
        verifyInvitationError(sysadmin.username, 'This person is already a team member.');

        // # Search and add an existing member by email who is not part of the team
        invitePeople(user1.email, 1, user1.username);

        // * Verify the content and message in next screen
        verifyInvitationSuccess(user1.username, 'This member has been added to the team.');

        // # Search and add a new member by email who is not part of the team
        const email = `temp-${getRandomInt(9999).toString()}@mattermost.com`;
        invitePeople(email, 1, email);

        // * Verify the content and message in next screen
        verifyInvitationSuccess(email, 'An invitation email has been sent.');
    });
});
