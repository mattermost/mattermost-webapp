// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('uiInviteMemberToCurrentTeam', (username) => {
    // # Open member invite screen
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
    cy.get('#invitePeople > button').should('contain.text', 'Invite People').click();

    // # Open members section if licensed for guest accounts
    cy.findByTestId('invitationModal').
        then((container) => container.find('[data-testid="inviteMembersLink"]')).
        then((link) => link && link.click());

    // # Enter bot username and submit
    cy.findByTestId('inputPlaceholder').find('input').type(username, {force: true}).as('input');
    cy.get('.users-emails-input__option ').contains(`@${username}`);
    cy.get('@input').type('{enter}', {force: true});
    cy.get('.invite-members button').click();

    // * Verify user invited to team
    cy.get('.invitation-modal-confirm-sent .InvitationModalConfirmStepRow').
        should('contain.text', `@${username}`).
        and('contain.text', 'This member has been added to the team.');

    // # Close, return
    cy.get('.confirm-done').click();
});
