// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../fixtures/users.json';

describe('View Members modal', () => {
    it('MM-20164 - Going from a Member to an Admin should update the modal', () => {
        cy.apiLogin('user-1');
        cy.apiGetMe().then((res) => {
            // # Promote user-1 as a system admin
            // # Visit default channel and verify members modal
            promoteToSysAdmin(res.body);
            cy.visit('/');
            verifyMemberDropdownAction(true);

            // # Make user a regular member
            // # Reload and verify members modal
            demoteToMember(res.body);
            cy.reload();
            verifyMemberDropdownAction(false);
        });
    });
});

const demoteToMember = (user) => {
    cy.externalRequest({user: users.sysadmin, method: 'put', path: `users/${user.id}/roles`, data: {roles: 'system_user'}});
};

const promoteToSysAdmin = (user) => {
    cy.externalRequest({user: users.sysadmin, method: 'put', path: `users/${user.id}/roles`, data: {roles: 'system_user system_admin'}});
};

function verifyMemberDropdownAction(hasActionItem) {
    // # Click member count to open member list popover
    cy.get('#member_popover').click();

    cy.get('#member-list-popover').should('be.visible').within(() => {
        // * Verify that the modal is open by checking its title
        cy.findByText('Channel Members').should('exist');

        // # Click "View Members"
        cy.findByText('View Members').click();
    });

    cy.get('#channelMembersModal').should('be.visible').within(() => {
        // * Verify that the title is correct
        cy.findByText('Town Square').should('be.visible');
        cy.findByText('Members').should('be.visible');

        // * Check to see any user has dropdown menu
        if (hasActionItem) {
            cy.findAllByText('Channel Member').should('exist');
        } else {
            cy.findByText('Channel Member').should('not.exist');
        }
    });
}
