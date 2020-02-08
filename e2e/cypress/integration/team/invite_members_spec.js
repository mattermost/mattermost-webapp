// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************
import users from '../../fixtures/users.json';

let testTeam;
const user1 = users['user-1'];
const user2 = users['user-2'];

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

function verifyInvitationSuccess() {
    // * Verify the content and success message in the Invitation Modal
    cy.findByTestId('invitationModal').within(($el) => {
        cy.wrap($el).find('h1').should('have.text', `Members Invited to ${testTeam.display_name}`);
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

function verifyInviteMembersModal() {
    // * Verify the header has changed in the modal
    cy.findByTestId('invitationModal').within(($el) => {
        cy.wrap($el).find('h1').should('have.text', `Invite Members to ${testTeam.display_name}`);
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
    before(() => {
        cy.apiUpdateConfig(
            {EmailSettings: {RequireEmailVerification: false}},
            {ServiceSettings: {EnableAPITeamDeletion: true}},
        );

        // # Login as new user
        cy.loginAsNewUser().then(() => {
            // # Create new team and visit its URL
            cy.apiCreateTeam('test-team', 'Test Team').then((response) => {
                testTeam = response.body;
                cy.visit('/');
                cy.visit(`/${testTeam.name}`);
            });
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
            cy.apiDeleteTeam(testTeam.id, true);
        }
    });

    // By default, member don't have "InviteGuest" permission
    // should go directly to "InviteMembers" modal
    it('Invite Members to Team as Member', () => {
        // # function to open and select invite menu item
        openClickInviteMenuItem();

        // * verify Invite Members
        verifyInviteMembersModal();

        // # invite existing user
        inviteUser(user1);

        // * verify Invitation was created successfully
        verifyInvitationSuccess();

        // * verify returned to "InviteMembers" modal
        verifyInviteMembersModal();

        // # close modal
        closeAndComplete();
    });

    // By default, sysadmin can Invite Guests, should go to "InvitePeople" modal
    it('Invite Members to Team as SysAdmin', () => {
        // # login and visit
        cy.apiLogin('sysadmin');
        cy.visit(`/${testTeam.name}`);

        // # function to open and select invite menu item
        openClickInviteMenuItem();

        // # function to verify and click "select members"
        verifyClickInvitePeopleDialog();

        // * verify Invite Members
        verifyInviteMembersModal();

        // # invite existing user
        inviteUser(user2);

        // * verify Invitation was created successfully
        verifyInvitationSuccess();

        // * verify returned to "InviteMembers" modal
        verifyClickInvitePeopleDialog();

        // # close module
        closeAndComplete();
    });
});