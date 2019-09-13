// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/**
 * Note: This test requires Enterprise license to be uploaded
 */
import {getRandomInt} from '../../utils';

describe('Guest Account - Member Invitation Flow', () => {
    before(() => {
        // # Enable Guest Account Settings
        cy.apiUpdateConfig({
            GuestAccountsSettings: {
                Enable: true,
            },
        });

        // # Login as "sysadmin" and go to /
        cy.apiLogin('sysadmin');
        cy.visit('/');
    });

    it('MM-18039 Verify UI Elements of Members Invitation Flow', () => {
        // # Get Current Team Name
        let teamName = '';
        const email = `temp-${getRandomInt(9999).toString()}@mattermost.com`;
        cy.get('#headerTeamName').should('be.visible').invoke('text').then(((text) => {
            teamName = text.trim();
        }));

        // #Open Invite People
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#invitePeople').should('be.visible').click();

        // *Verify UI Elements in initial step
        cy.getByTestId('invitationModal').within(($el) => {
            cy.wrap($el).find('h1').should('have.text', `Invite people to ${teamName}`);
        });
        cy.getByTestId('inviteMembersLink').should('be.visible').within(($el) => {
            cy.wrap($el).getByTestId('inviteMembersSection').should('have.text', 'Invite MembersInvite new team members with a link or by email. Team members have access to messages and files in open teams and public channels.');
            cy.wrap($el).find('.arrow').click();
        });

        // *Verify Share Link field
        cy.getByTestId('shareLinkInput').should('be.visible').and('not.have.value', '');
        cy.getByTestId('shareLinkInputButton').should('be.visible').and('have.text', 'Copy Link');

        // *Verify Invite People field
        cy.get('#inviteMembersButton').scrollIntoView().should('be.visible').and('be.disabled');
        cy.getByTestId('inputPlaceholder').should('be.visible').within(($el) => {
            // # Type the email of the new user
            cy.wrap($el).get('input').type(email, {force: true});
            cy.wrap($el).get('.users-emails-input__menu').
                children().should('have.length', 1).
                eq(0).should('contain', `Invite ${email} as a team member`).click();
        });

        // *Verify if invite members button is not disabled when an email is added
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
});
