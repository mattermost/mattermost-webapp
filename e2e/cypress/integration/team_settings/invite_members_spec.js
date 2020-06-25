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
    // * validating the side bar is visible
    cy.get('#sidebarHeaderDropdownButton').should('be.visible');

    // # clicking on the side bar
    cy.get('#sidebarHeaderDropdownButton').click();

    // * Team settings button must be visible
    cy.get('#invitePeople').should('be.visible').and('contain', 'Invite People');

    // # click on the Team settings button
    cy.get('#invitePeople').click();
}

function verifyClickInvitePeopleDialog() {
    // * verify the team settings dialog is open
    cy.get('#invitation_modal_title').should('be.visible').and('contain', 'Invite people');

    // # clicking on edit button
    cy.get('#inviteMembersSectionDescription').click();
}

function verifyInvitationSuccess(team) {
    // * Verify the content and success message in the Invitation Modal
    cy.findByTestId('invitationModal').within(($el) => {
        cy.wrap($el).find('h1').should('have.text', `Members Invited to ${team.display_name}`);
        cy.wrap($el).find('h2.subtitle > span').should('have.text', '1 person has been invited');
        cy.wrap($el).find('div.invitation-modal-confirm-not-sent').should('not.exist');
        cy.wrap($el).find('div.invitation-modal-confirm-sent').should('be.visible').within(($subel) => {
            cy.wrap($subel).find('h2 > span').should('have.text', 'Successful Invites');
            cy.wrap($subel).find('.people-header').should('have.text', 'People');
            cy.wrap($subel).find('.details-header').should('have.text', 'Details');
        });
        cy.wrap($el).find('.confirm-done').should('be.visible');
        cy.wrap($el).find('.invite-more').should('be.visible').and('not.be.disabled').click();
    });
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
    // # input email, select member
    cy.findByTestId('inputPlaceholder').should('be.visible').within(($el) => {
        cy.wrap($el).get('input').type(user.email, {force: true});
        cy.wrap($el).get('.users-emails-input__menu').
            children().eq(0).should('contain', user.username).click();
    });

    // # Click Invite Members
    cy.get('#inviteMembersButton').scrollIntoView().click();
}

function closeAndComplete() {
    // # close modal
    cy.get('#closeIcon').should('be.visible').click();

    // * verify the modal closed
    cy.get('.InvitationModal').should('not.exist');
}

describe('Invite Members', () => {
    let testUser;
    let userOne;
    let userTwo;
    let testTeam;

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

    beforeEach(() => {
        cy.apiAdminLogin();

        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;
            testTeam = team;

            cy.apiCreateUser({bypassTutorial: false}).then(({user: user1}) => {
                userOne = user1;
                cy.apiAddUserToTeam(testTeam.id, userOne.id);
            });

            cy.apiCreateUser({bypassTutorial: false}).then(({user: user2}) => {
                userTwo = user2;
                cy.apiAddUserToTeam(testTeam.id, userTwo.id);
            });
        });
    });

    // By default, member don't have "InviteGuest" permission
    // should go directly to "InviteMembers" modal
    it('Invite Members to Team as Member', () => {
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # function to open and select invite menu item
        openClickInviteMenuItem();

        // * verify Invite Members
        verifyInviteMembersModal(testTeam);

        // # invite existing user
        inviteUser(userOne);

        // * verify Invitation was created successfully
        verifyInvitationSuccess(testTeam);

        // * verify returned to "InviteMembers" modal
        verifyInviteMembersModal(testTeam);

        // # close modal
        closeAndComplete();
    });

    // By default, sysadmin can Invite Guests, should go to "InvitePeople" modal
    it('Invite Members to Team as SysAdmin', () => {
        // # login and visit
        cy.apiAdminLogin();
        cy.visit(`/${testTeam.name}/channels/off-topic`);

        // # function to open and select invite menu item
        openClickInviteMenuItem();

        // # function to verify and click "select members"
        verifyClickInvitePeopleDialog();

        // * verify Invite Members
        verifyInviteMembersModal(testTeam);

        // # invite existing user
        inviteUser(userTwo);

        // * verify Invitation was created successfully
        verifyInvitationSuccess(testTeam);

        // * verify returned to "InviteMembers" modal
        verifyClickInvitePeopleDialog();

        // # close module
        closeAndComplete();
    });
});
