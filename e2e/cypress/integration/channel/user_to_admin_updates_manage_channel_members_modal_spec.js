// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../fixtures/users.json';

const demoteToMember = (user) => {
    const baseUrl = Cypress.config('baseUrl');
    cy.externalRequest({user: users.sysadmin, method: 'put', baseUrl, path: `users/${user.id}/roles`, data: {roles: 'system_user'}});
};

const promoteToSysAdmin = (user) => {
    const baseUrl = Cypress.config('baseUrl');
    cy.externalRequest({user: users.sysadmin, method: 'put', baseUrl, path: `users/${user.id}/roles`, data: {roles: 'system_user system_admin'}});
};

describe('View Members modal', () => {
    it('MM-20164 - Going from a Member to an Admin should update the modal', () => {
        cy.apiLogin('user-1');
        cy.apiGetMe().then((res) => {
            // # Make user a regular member
            demoteToMember(res.body);

            // # Visit Town square and go to view members modal
            cy.visit('/');
            cy.get('#sidebarItem_town-square').click({force: true});
            cy.get('#member_popover').click();
            cy.findByTestId('membersModal').click();

            // * Check to see if no drop down menu exists
            cy.findAllByTestId('userListItemActions').then((el) => {
                expect(el[0].childElementCount).equal(0);
            });

            // Promote user to a system admin
            promoteToSysAdmin(res.body);

            // * Check to see if a drop now exists now
            cy.findAllByTestId('userListItemActions').then((el) => {
                expect(el[0].childElementCount).equal(1);
            });
        });
    });
});
