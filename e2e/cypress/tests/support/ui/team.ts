// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {ChainableT} from 'tests/types';

function uiInviteMemberToCurrentTeam(username: string) {
    // # Open member invite screen
    cy.uiOpenTeamMenu('Invite People');

    // # Open members section if licensed for guest accounts
    cy.findByTestId('invitationModal').
        then((container) => container.find('[data-testid="inviteMembersLink"]')).
        then((link) => link && link.click());

    // # Enter bot username and submit
    cy.get('.users-emails-input__control input').typeWithForce(username).as('input');
    cy.get('.users-emails-input__option ').contains(`@${username}`);
    cy.get('@input').typeWithForce('{enter}');
    cy.get('#inviteMembersButton').click();

    // * Verify user invited to team
    cy.get('.invitation-modal-confirm--sent .InviteResultRow').
        should('contain.text', `@${username}`).
        and('contain.text', 'This member has been added to the team.');

    // # Close, return
    cy.findByTestId('confirm-done').click();
}

Cypress.Commands.add('uiInviteMemberToCurrentTeam', uiInviteMemberToCurrentTeam);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Wait for a message to get posted as the last post.
             * @param {string} userName - username of a bot
             *
             * @example
             * const userName = {bot}
             *   cy.uiInviteMemberToCurrentTeam(userName);
             */
            uiInviteMemberToCurrentTeam: typeof uiInviteMemberToCurrentTeam;
        }
    }
}
