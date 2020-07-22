// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channel

import {getAdminAccount} from '../../support/env';

const demoteToMember = (user, admin) => {
    cy.externalRequest({user: admin, method: 'put', path: `users/${user.id}/roles`, data: {roles: 'system_user'}});
};

const demoteToChannelMember = (user, channelId, admin) => {
    cy.externalRequest({
        user: admin,
        method: 'put',
        path: `channels/${channelId}/members/${user.id}/schemeRoles`,
        data: {
            scheme_user: true,
            scheme_admin: false,
        },
    });
};

const promoteToChannelAdmin = (user, channelId, admin) => {
    cy.externalRequest({
        user: admin,
        method: 'put',
        path: `channels/${channelId}/members/${user.id}/schemeRoles`,
        data: {
            scheme_user: true,
            scheme_admin: true,
        },
    });
};

describe('Change Roles', () => {
    const admin = getAdminAccount();
    let testUser;
    let townsquareChannelId;

    beforeEach(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;

            cy.apiCreateUser().then(({user: otherUser}) => {
                cy.apiAddUserToTeam(team.id, otherUser.id);
            });

            cy.apiLogin(testUser);
            cy.visit(`/${team.name}/channels/town-square`);

            // # Get channel membership
            cy.getCurrentChannelId().then((id) => {
                townsquareChannelId = id;

                // # Make user a regular member for channel and system
                demoteToMember(testUser, admin);
                demoteToChannelMember(testUser, townsquareChannelId, admin);

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
        promoteToChannelAdmin(testUser, townsquareChannelId, admin);

        // * Check to see if a drop now exists now
        cy.get('.filtered-user-list').should('be.visible').within(() => {
            cy.findByText('Channel Admin').should('exist');
            cy.findByText('Channel Member').should('exist');
        });
    });
});
