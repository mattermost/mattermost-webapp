// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export function changeGuestFeatureSettings(featureFlag = true, emailInvitation = true, whitelistedDomains = '') {
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

export function invitePeople(typeText, resultsCount, verifyText, channelName = 'Town Square', clickInvite = true) {
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

export function verifyInvitationError(user, team, errorText, verifyGuestBadge = false) {
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

export function verifyInvitationSuccess(user, team, successText, verifyGuestBadge = false) {
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
