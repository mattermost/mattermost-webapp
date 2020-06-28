// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

import * as TIMEOUTS from '../../fixtures/timeouts';

import users from '../../fixtures/users.json';

const userActive = users['user-1'];

describe('Messaging', () => {
    beforeEach(() => {
        // # Create new user that will eventually be inactive
        cy.apiAdminLogin();
        cy.apiCreateUser().then((res) => {
            cy.wrap(res.user).as('userInactive');
        });
    });

    it('M23349 - Deactivated users are not shown in Direct Messages modal', () => {
        // # Deactivate inactive user
        cy.get('@userInactive').then((userInactive) => {
            // # Login as active user
            cy.apiLogin(userActive);

            // # Deactivate inactive user
            cy.apiActivateUser(userInactive.id, false);

            // # Visit main channel
            cy.visit('/ad-1/channels/town-square');

            // # click on '+' sign next to 'Direct Messages'
            cy.get('#addDirectChannel').click().wait(TIMEOUTS.HALF_SEC);

            // * Assert that 'Direct Messages' modal appears
            cy.get('#moreDmModal').should('be.visible');

            // # Search for inactive user
            cy.get('#selectItems input').focus().type(userInactive.email, {force: true}).wait(TIMEOUTS.HALF_SEC);

            // * Assert that the input box contains searched email
            cy.get('#selectItems input').should('have.value', userInactive.email);

            // * Assert that the inactive user is not found
            cy.get('#moreDmModal .no-channel-message').should('be.visible').and('contain', 'No items found');
        });
    });

    it('M23349 - Deactivated users are shown in Direct Messages modal after previous conversations', () => {
        cy.get('@userInactive').then((userInactive) => {
            // # Login as active user
            cy.apiLogin(userActive);

            // # Create a 'Direct Messages' channel with inactive user
            cy.apiGetUsers([userActive.username, userInactive.username]).then((res) => {
                const usersInfo = res.body;
                cy.apiCreateDirectChannel(usersInfo.map((user) => user.id));
            });

            // # Deactivate inactive user
            cy.apiActivateUser(userInactive.id, false);

            // # Visit main channel
            cy.visit('/ad-1/channels/town-square');

            // # click on '+' sign next to 'Direct Messages'
            cy.get('#addDirectChannel').click().wait(TIMEOUTS.HALF_SEC);

            // * Assert that 'Direct Messages' modal appears
            cy.get('#moreDmModal').should('be.visible');

            // # Search for inactive user
            cy.get('#selectItems input').focus().type(userInactive.email, {force: true}).wait(TIMEOUTS.HALF_SEC);

            // * Assert that the input box contains searched email
            cy.get('#selectItems input').should('have.value', userInactive.email);

            // * Assert that the inactive user is actually found
            cy.get('#moreDmModal .more-modal__list').should('be.visible').and('contain', userInactive.username);
        });
    });
});
