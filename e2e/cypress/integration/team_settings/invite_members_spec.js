// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @team_settings

function openClickInviteMenuItem() {
    // * Verify the side bar is visible
    cy.get('#sidebarHeaderDropdownButton').should('be.visible');

    // # Click on the side bar
    cy.get('#sidebarHeaderDropdownButton').click();

    // * Verify Invite People button is visible
    cy.get('#invitePeople').should('be.visible').and('contain', 'Invite People');

    // # Click on the Invite People button
    cy.get('#invitePeople').click();
}

function verifyClickInvitePeopleDialog() {
    // * Verify the Invite People dialog is open
    cy.get('#invitation_modal_title').should('be.visible').and('contain', 'Invite people');

    // # Click on Invite Members selection description
    cy.get('#inviteMembersSectionDescription').click();
}

function verifyInvitationTable($subel, tableTitle, user, reason) {
    cy.wrap($subel).find('h2 > span').should('have.text', tableTitle);
    cy.wrap($subel).find('.people-header').should('have.text', 'People');
    cy.wrap($subel).find('.details-header').should('have.text', 'Details');
    cy.wrap($subel).find('.username-or-icon').should('contain', `@${user.username} - ${user.first_name} ${user.last_name} (${user.nickname})`);
    cy.wrap($subel).find('.reason').should('have.text', reason);
}

function verifyInvitationResult(team, user, title, reason, isInvitationSent) {
    // * Verify the content and success message in the Invitation Modal
    cy.findByTestId('invitationModal').within(($el) => {
        cy.wrap($el).find('h1').should('have.text', `Members Invited to ${team.display_name}`);
        cy.wrap($el).find('h2.subtitle > span').should('have.text', title);
        if (isInvitationSent) {
            cy.wrap($el).find('div.invitation-modal-confirm-not-sent').should('not.exist');
            cy.wrap($el).find('div.invitation-modal-confirm-sent').should('be.visible').within(($subel) => {
                verifyInvitationTable($subel, 'Successful Invites', user, reason);
            });
        } else {
            cy.wrap($el).find('div.invitation-modal-confirm-sent').should('not.exist');
            cy.wrap($el).find('div.invitation-modal-confirm-not-sent').should('be.visible').within(($subel) => {
                verifyInvitationTable($subel, 'Invitations Not Sent', user, reason);
            });
        }

        cy.wrap($el).find('.confirm-done').should('be.visible');
        cy.wrap($el).find('.invite-more').should('be.visible').and('not.be.disabled').click();
    });
}

function verifyInvitationSuccess(team, user) {
    verifyInvitationResult(team, user, '1 person has been invited', 'This member has been added to the team.', true);
}

function verifyInvitationError(team, user) {
    verifyInvitationResult(team, user, '1 invitation was not sent', 'This person is already a team member.', false);
}

function verifyInviteMembersModal(team) {
    // * Verify the header has changed in the modal
    cy.findByTestId('invitationModal').within(($el) => {
        cy.wrap($el).find('h1').should('have.text', `Invite Members to ${team.display_name}`);
    });

    // * Verify Share Link Header and helper text
    cy.findByTestId('shareLink').should('be.visible').within(($el) => {
        cy.wrap($el).find('h2 > span').should('have.text', 'Share This Link');
        cy.wrap($el).find('.help-text > span').should('have.text', 'Share this link to invite people to this team.');
    });
}

function inviteUser(user) {
    // # Input email, select member
    cy.findByTestId('inputPlaceholder').should('be.visible').within(($el) => {
        cy.wrap($el).get('input').type(user.email, {force: true});
        cy.wrap($el).get('.users-emails-input__menu').
            children().eq(0).should('contain', user.username).click();
    });

    // # Click Invite Members
    cy.get('#inviteMembersButton').scrollIntoView().click();
}

function inviteUserToTeamAsMember(testUser, testTeam, user) {
    // # Login and visit
    cy.apiLogin(testUser.username, testUser.password);
    cy.visit(`/${testTeam.name}/channels/town-square`);

    // # Open and select invite menu item
    openClickInviteMenuItem();

    // * Verify Invite Members
    verifyInviteMembersModal(testTeam);

    // # Invite user
    inviteUser(user);
}

function inviteUserToTeamAsSysadmin(testTeam, user) {
    // # Login and visit
    cy.apiAdminLogin();
    cy.visit(`/${testTeam.name}/channels/off-topic`);

    // # Open and select invite menu item
    openClickInviteMenuItem();

    // * Verify and click "select members"
    verifyClickInvitePeopleDialog();

    // * Verify Invite Members
    verifyInviteMembersModal(testTeam);

    // # Invite user
    inviteUser(user);
}

function closeAndComplete() {
    // # Close modal
    cy.get('#closeIcon').should('be.visible').click();

    // * Verify the modal closed
    cy.get('.InvitationModal').should('not.exist');
}

describe('Invite Members', () => {
    let testUser;
    let testTeam;
    let userToBeInvited;

    before(() => {
        // # Enable API Team Deletion
        // # Disable Require Email Verification
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableAPITeamDeletion: true,
            },
            EmailSettings: {
                RequireEmailVerification: false,
            },
        });
    });

    afterEach(() => {
        // # close modal
        closeAndComplete();
    });

    describe('Invite Members - user to be invited not added to existing team', () => {
        beforeEach(() => {
            cy.apiAdminLogin();

            cy.apiInitSetup().then(({team, user}) => {
                testUser = user;
                testTeam = team;

                cy.apiCreateUser({bypassTutorial: false}).then(({user: otherUser}) => {
                    userToBeInvited = otherUser;
                });
            });
        });

        // By default, member don't have "InviteGuest" permission
        // should go directly to "InviteMembers" modal
        it('Invite Members to Team as Member - invitation sent', () => {
            inviteUserToTeamAsMember(testUser, testTeam, userToBeInvited);

            // * Verify Invitation was created successfully
            verifyInvitationSuccess(testTeam, userToBeInvited);

            // * Verify returned to "InviteMembers" modal
            verifyInviteMembersModal(testTeam);
        });

        // By default, sysadmin can Invite Guests, should go to "InvitePeople" modal
        it('Invite Members to Team as SysAdmin - invitation sent', () => {
            inviteUserToTeamAsSysadmin(testTeam, userToBeInvited);

            // * Verify Invitation was created successfully
            verifyInvitationSuccess(testTeam, userToBeInvited);

            // * Verify returned to "InvitePeople" modal
            verifyClickInvitePeopleDialog();
        });
    });

    describe('Invite Members - user to be invited already member of existing team', () => {
        beforeEach(() => {
            cy.apiAdminLogin();

            cy.apiInitSetup().then(({team, user}) => {
                testUser = user;
                testTeam = team;

                cy.apiCreateUser({bypassTutorial: false}).then(({user: otherUser}) => {
                    userToBeInvited = otherUser;
                    cy.apiAddUserToTeam(testTeam.id, userToBeInvited.id);
                });
            });
        });

        // By default, member don't have "InviteGuest" permission
        // should go directly to "InviteMembers" modal
        it('Invite Members to Team as Member - invitation not sent', () => {
            inviteUserToTeamAsMember(testUser, testTeam, userToBeInvited);

            // * Verify Invitation was not sent
            verifyInvitationError(testTeam, userToBeInvited);

            // * Verify returned to "InviteMembers" modal
            verifyInviteMembersModal(testTeam);
        });

        // By default, sysadmin can Invite Guests, should go to "InvitePeople" modal
        it('Invite Members to Team as SysAdmin - invitation not sent', () => {
            inviteUserToTeamAsSysadmin(testTeam, userToBeInvited);

            // * Verify Invitation was not sent
            verifyInvitationError(testTeam, userToBeInvited);

            // * Verify returned to "InvitePeople" modal
            verifyClickInvitePeopleDialog();
        });
    });
});
