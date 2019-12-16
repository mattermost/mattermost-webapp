// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../fixtures/users.json';

const demoteToMember = (user) => {
    cy.externalRequest({user: users.sysadmin, method: 'put', path: `users/${user.id}/roles`, data: {roles: 'system_user'}});
};

const demoteToChannelMember = (user, channelId) => {
    cy.externalRequest({
        user: users.sysadmin,
        method: 'put',
        path: `channels/${channelId}/members/${user.id}/schemeRoles`,
        data: {
            scheme_user: true,
            scheme_admin: false,
        }
    });
};

const promoteToChannelAdmin = (user, channelId) => {
    cy.externalRequest({
        user: users.sysadmin,
        method: 'put',
        path: `channels/${channelId}/members/${user.id}/schemeRoles`,
        data: {
            scheme_user: true,
            scheme_admin: true,
        }
    });
};

let townsquareChannelId;
let userInfo;
describe('Change Roles', () => {
    beforeEach(() => {
        // # Get user information
        cy.apiLogin('user-1');
        cy.apiGetMe().then((res) => {
            userInfo = res.body;

            // # Visit Town square and go to view members modal
            cy.visit('/');
            cy.get('#sidebarItem_town-square').click({force: true});

            // # Get channel membership
            cy.getCurrentChannelId().then((id) => {
                townsquareChannelId = id;

                // # Make user a regular member for channel and system
                demoteToMember(userInfo);
                demoteToChannelMember(userInfo, townsquareChannelId);

                // # Reload page to ensure no cache or saved information
                cy.reload(true);
            });
        });
    });
    it('MM-10858 - Going from a Channel Member to Channel Admin update view member modal without refresh', () => {
        // # Go to member modal
        cy.get('#member_popover').click();
        cy.findByTestId('membersModal').click();

        // * Check to see if no drop down menu exists
        cy.findAllByTestId('userListItemActions').then((el) => {
            cy.wrap(el[0]).should('not.be.visible');
        });

        // Promote user to a channel admin
        promoteToChannelAdmin(userInfo, townsquareChannelId);

        // * Check to see if a drop now exists now
        cy.findAllByTestId('userListItemActions').then((el) => {
            cy.wrap(el[0]).should((children) => {
                expect(children).contain('Channel Member');
            });
        });
    });
});
