// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @guest_account

/**
 * Note: This test requires Enterprise license to be uploaded
 */
import {getRandomId} from '../../../utils';
import {getAdminAccount} from '../../../support/env';
import * as TIMEOUTS from '../../../fixtures/timeouts';

function invitePeople(typeText, resultsCount, verifyText, clickInvite = true) {
    // # Open Invite People
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
    cy.get('#invitePeople').should('be.visible').click();

    // # Search and add a member
    cy.findByTestId('inputPlaceholder').should('be.visible').within(() => {
        cy.get('input').type(typeText, {force: true});
        cy.get('.users-emails-input__menu').
            children().should('have.length', resultsCount).eq(0).should('contain', verifyText).click();
        cy.get('input').tab();
    });

    // # Click Invite Members
    if (clickInvite) {
        cy.get('#inviteMembersButton').scrollIntoView().click();
    }
}

function verifyInvitationError(user, team, errorText) {
    // * Verify the content and error message in the Invitation Modal
    cy.findByTestId('invitationModal').within(() => {
        cy.get('h1').should('have.text', `Members Invited to ${team.display_name}`);
        cy.get('h2.subtitle > span').should('have.text', '1 invitation was not sent');
        cy.get('div.invitation-modal-confirm-sent').should('not.exist');
        cy.get('div.invitation-modal-confirm-not-sent').should('be.visible').within(() => {
            cy.get('h2 > span').should('have.text', 'Invitations Not Sent');
            cy.get('.people-header').should('have.text', 'People');
            cy.get('.details-header').should('have.text', 'Details');
            cy.get('.username-or-icon').should('contain', user);
            cy.get('.reason').should('have.text', errorText);
        });
        cy.get('.confirm-done').should('be.visible').and('not.be.disabled').click();
    });

    // * Verify if Invitation Modal was closed
    cy.get('.InvitationModal').should('not.exist');
}

function verifyInvitationSuccess(user, team, successText) {
    // * Verify the content and success message in the Invitation Modal
    cy.findByTestId('invitationModal').within(() => {
        cy.get('h1').should('have.text', `Members Invited to ${team.display_name}`);
        cy.get('h2.subtitle > span').should('have.text', '1 person has been invited');
        cy.get('div.invitation-modal-confirm-not-sent').should('not.exist');
        cy.get('div.invitation-modal-confirm-sent').should('be.visible').within(() => {
            cy.get('h2 > span').should('have.text', 'Successful Invites');
            cy.get('.people-header').should('have.text', 'People');
            cy.get('.details-header').should('have.text', 'Details');
            cy.get('.username-or-icon').should('contain', user);
            cy.get('.reason').should('have.text', successText);
        });
        cy.get('.confirm-done').should('be.visible').and('not.be.disabled').click();
    });

    // * Verify if Invitation Modal was closed
    cy.get('.InvitationModal').should('not.exist');
}

function loginAsNewUser(team) {
    // # Login as new user and get the user id
    cy.apiCreateUser().then(({user}) => {
        cy.apiAddUserToTeam(team.id, user.id);

        cy.apiLogin(user);
        cy.visit(`/${team.name}`);
    });
}

describe('Guest Account - Member Invitation Flow', () => {
    const sysadmin = getAdminAccount();
    let testTeam;
    let testUser;

    beforeEach(() => {
        // # Login as sysadmin
        cy.apiAdminLogin();

        // * Check if server has license for Guest Accounts
        cy.apiRequireLicenseForFeature('GuestAccounts');

        // # Enable Guest Account Settings
        cy.apiUpdateConfig({
            GuestAccountsSettings: {
                Enable: true,
            },
            ServiceSettings: {
                EnableEmailInvitations: true,
                IdleTimeout: 300,
            },
        });

        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;
            testTeam = team;

            // # Go to town square
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('MM-18039 Verify UI Elements of Members Invitation Flow', () => {
        const email = `temp-${getRandomId()}@mattermost.com`;

        // # Open Invite People
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#invitePeople').should('be.visible').click();

        // * Verify UI Elements in initial step
        cy.findByTestId('invitationModal').within(() => {
            cy.get('h1').should('have.text', `Invite people to ${testTeam.display_name}`);
        });
        cy.findByTestId('inviteMembersLink').should('be.visible').within(() => {
            cy.findByTestId('inviteMembersSection').find('h2 > span').should('have.text', 'Invite Members');
            cy.findByTestId('inviteMembersSection').find('span').last().should('have.text', 'Invite new team members with a link or by email. Team members have access to messages and files in open teams and public channels.');
            cy.get('.arrow').click();
        });

        // * Verify the header has changed in the modal
        cy.findByTestId('invitationModal').within(() => {
            cy.get('h1').should('have.text', `Invite Members to ${testTeam.display_name}`);
        });

        // * Verify Share Link Header and helper text
        cy.findByTestId('shareLink').should('be.visible').within(() => {
            cy.get('h2 > span').should('have.text', 'Share This Link');
            cy.get('.help-text > span').should('have.text', 'Share this link to invite people to this team.');
        });

        // * Verify Share Link Input field
        const baseUrl = Cypress.config('baseUrl');
        cy.findByTestId('shareLinkInput').should('be.visible').and('have.value', `${baseUrl}/signup_user_complete/?id=${testTeam.invite_id}`);

        // * Verify Copy Link button text
        cy.findByTestId('shareLinkInputButton').should('be.visible').and('have.text', 'Copy Link');

        // * Verify Invite People field
        cy.findByTestId('searchAdd').should('be.visible').within(() => {
            cy.get('h2 > span').should('have.text', 'Add or Invite People');
            cy.get('.help-text > span').should('have.text', 'Add existing members or send email invites to new members.');
        });
        cy.get('#inviteMembersButton').scrollIntoView().should('be.visible').and('be.disabled');
        cy.findByTestId('inputPlaceholder').should('be.visible').within(() => {
            // * Verify the input placeholder text
            cy.get('.users-emails-input__placeholder').should('have.text', 'Add members or email addresses');

            // # Type the email of the new user
            cy.get('input').type(email, {force: true});
            cy.get('.users-emails-input__menu').
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
        cy.apiCreateTeam('team', 'Team').then(({team}) => {
            // # Login as new user
            loginAsNewUser(team);

            // # Search and add an existing member by username who is part of the team
            invitePeople(sysadmin.username, 1, sysadmin.username);

            // * Verify the content and message in next screen
            verifyInvitationError(sysadmin.username, team, 'This person is already a team member.');

            // # Search and add an existing member by email who is not part of the team
            invitePeople(testUser.email, 1, testUser.username);

            // * Verify the content and message in next screen
            verifyInvitationSuccess(testUser.username, team, 'This member has been added to the team.');

            // # Search and add a new member by email who is not part of the team
            const email = `temp-${getRandomId()}@mattermost.com`;
            invitePeople(email, 1, email);

            // * Verify the content and message in next screen
            verifyInvitationSuccess(email, team, 'An invitation email has been sent.');
        });
    });

    it('MM-22037 Invite Member via Email containing upper case letters', () => {
        // # Login as new user
        loginAsNewUser(testTeam);

        // # Invite a email containing uppercase letters
        const email = `tEMp-${getRandomId()}@mattermost.com`;
        invitePeople(email, 1, email);

        // * Verify the content and message in next screen
        verifyInvitationSuccess(email, testTeam, 'An invitation email has been sent.');
    });

    it('MM-T1324 Invite Members - Team Link - New User', () => {
        // # Wait for page to load and then logout. Else invite members link will be redirected to login page
        cy.get('#post_textbox').should('be.visible').wait(TIMEOUTS.TWO_SEC);
        const inviteMembersLink = `/signup_user_complete/?id=${testTeam.invite_id}`;
        cy.apiLogout();

        // # Visit the Invite Members link
        cy.visit(inviteMembersLink);

        // * Verify the sign up options
        cy.findByText('AD/LDAP Credentials').should('be.visible');
        cy.findByText('Email and Password').should('be.visible').click();

        // # Sign up via email
        const username = `temp-${getRandomId()}`;
        const email = `${username}@mattermost.com`;
        cy.get('#email').type(email);
        cy.get('#name').type(username);
        cy.get('#password').type('Testing123');
        cy.findByText('Create Account').click();

        // * Verify if user is added to the invited team
        cy.get('#headerTeamName').should('have.text', testTeam.display_name);

        // * Verify if user has access to the default channels
        cy.get('#sidebarChannelContainer').within(() => {
            cy.findByText('Off-Topic').should('be.visible');
            cy.findByText('Town Square').should('be.visible');
        });
    });

    it('MM-T1325 Invite Members - Team Link - Existing User', () => {
        // # Login as sysadmin and create a new team
        cy.apiAdminLogin();
        cy.apiCreateTeam('team', 'Team').then(({team}) => {
            // # Visit the team and wait for page to load and then logout.
            cy.visit(`/${team.name}/channels/town-square`);
            cy.get('#post_textbox').should('be.visible').wait(TIMEOUTS.TWO_SEC);
            const inviteMembersLink = `/signup_user_complete/?id=${team.invite_id}`;
            cy.apiLogout();

            // # Visit the Invite Members link
            cy.visit(inviteMembersLink);

            // # Click on the login option
            cy.findByText('Click here to sign in.').should('be.visible').click();

            // # Login as user
            cy.get('#loginId').type(testUser.username);
            cy.get('#loginPassword').type('passwd');
            cy.findByText('Sign in').click();

            // * Verify if user is added to the invited team
            cy.get(`#${testTeam.name}TeamButton`).as('teamButton').should('be.visible').within(() => {
                cy.get('.badge').should('be.visible').and('have.text', 1);
            });

            cy.get('@teamButton').click().wait(TIMEOUTS.TWO_SEC);

            // * Verify if user has access to the default channels in the invited teams
            cy.get('#sidebarChannelContainer').within(() => {
                cy.findByText('Off-Topic').should('be.visible');
                cy.findByText('Town Square').should('be.visible');
            });
        });
    });

    it('MM-T1330 Invite Members - New User not in the system', () => {
        // # Login as sysadmin and create a new team
        cy.apiAdminLogin();

        cy.apiCreateTeam('team', 'Team').then(({team}) => {
            // # Login as new user
            loginAsNewUser(team);

            // # Search and add an existing member by username who is part of the team
            invitePeople(testUser.email, 1, testUser.username, false);

            // # Add a random username without proper email address format
            const username = `temp-${getRandomId()}`;
            cy.findByTestId('inputPlaceholder').should('be.visible').within(() => {
                cy.get('input').type(username, {force: true});
            });

            // # Click Invite Members
            cy.get('#inviteMembersButton').scrollIntoView().click();

            // * Verify the content and message in the Invitation Modal
            cy.findByTestId('invitationModal').within(() => {
                cy.get('h1').should('have.text', `Members Invited to ${team.display_name}`);
                cy.get('h2.subtitle > span').should('have.text', '1 person has been invited, and 1 invitation was not sent');
                cy.get('div.invitation-modal-confirm-not-sent').should('be.visible').within(() => {
                    cy.get('h2 > span').should('have.text', 'Invitations Not Sent');
                    cy.get('.people-header').should('have.text', 'People');
                    cy.get('.details-header').should('have.text', 'Details');
                    cy.get('.username-or-icon').should('contain', username);
                    cy.get('.reason').should('have.text', 'Does not match a valid user or email.');
                });

                cy.get('div.invitation-modal-confirm-sent').should('be.visible').within(() => {
                    cy.get('h2 > span').should('have.text', 'Successful Invites');
                    cy.get('.people-header').should('have.text', 'People');
                    cy.get('.details-header').should('have.text', 'Details');
                    cy.get('.username-or-icon').should('contain', testUser.username);
                    cy.get('.reason').should('have.text', 'This member has been added to the team.');
                });
            });
        });
    });
});
