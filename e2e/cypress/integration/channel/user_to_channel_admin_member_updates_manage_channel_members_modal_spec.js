// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

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
    let testChannelId;

    beforeEach(() => {
        // # Login as test user and visit test channel
        cy.apiInitSetup().then(({team, user, channel}) => {
            testUser = user;
            testChannelId = channel.id;

            cy.apiCreateUser().then(({user: otherUser}) => {
                cy.apiAddUserToTeam(team.id, otherUser.id);
            });

            cy.apiLogin(testUser);
            cy.visit(`/${team.name}/channels/${channel.name}`);

            // # Make user a regular member for channel and system
            demoteToMember(testUser, admin);
            demoteToChannelMember(testUser, testChannelId, admin);

            // # Reload page to ensure no cache or saved information
            cy.reload(true);
        });
    });

    it('MM-T4174 User role to channel admin/member updates channel member modal immediately without refresh', () => {
        // # Go to member modal
        cy.uiGetChannelMemberButton().click();
        cy.findByText('Manage Members').click();

        // * Check to see if no drop down menu exists
        cy.findAllByTestId('userListItemActions').then((el) => {
            cy.wrap(el[0]).should('not.be.visible');
        });

        // Promote user to a channel admin
        promoteToChannelAdmin(testUser, testChannelId, admin);

        // * Check to see if a dropdown exists now
        cy.get('.filtered-user-list').should('be.visible').within(() => {
            cy.findByText('Channel Admin').should('exist');
            cy.findByText('Channel Member').should('exist');
        });
    });
});
