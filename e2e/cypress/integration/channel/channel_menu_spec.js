// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../fixtures/users.json';

function demoteUserToGuest(user) {
    // # Issue a Request to demote the user to guest
    const baseUrl = Cypress.config('baseUrl');
    cy.externalRequest({user: users.sysadmin, method: 'post', baseUrl, path: `users/${user.id}/demote`});
}

function promoteGuestToUser(user) {
    // # Issue a Request to promote the guest to user
    const baseUrl = Cypress.config('baseUrl');
    cy.externalRequest({user: users.sysadmin, method: 'post', baseUrl, path: `users/${user.id}/promote`});
}

describe('Channel header menu', () => {
    let testChannel;

    beforeEach(() => {
        // # Login as sysadmin
        cy.apiLogin('sysadmin');

        // * Check if server has license for Guest Accounts
        cy.requireLicenseForFeature('GuestAccounts');

        // # Enable Guest Accounts
        cy.apiUpdateConfig({
            GuestAccountsSettings: {
                Enable: true,
            },
        });

        // # Create and login as new user
        cy.apiCreateAndLoginAsNewUser().as('newuser');
    });

    afterEach(() => {
        cy.apiLogin('sysadmin');
        if (testChannel && testChannel.id) {
            cy.apiDeleteChannel(testChannel.id);
        }
    });

    it('MM-14490 show/hide properly menu dividers', () => {
        // # Go to "/"
        cy.visit('/ad-1/channels/town-square');

        cy.getCurrentTeamId().then((teamId) => {
            // # Create new test channel
            cy.apiCreateChannel(teamId, 'channel-test', 'Channel Test').then((res) => {
                testChannel = res.body;

                // # Select channel on the left hand side
                cy.get(`#sidebarItem_${testChannel.name}`).click();

                // * Channel's display name should be visible at the top of the center pane
                cy.get('#channelHeaderTitle').should('contain', testChannel.display_name);

                // # Then click it to access the drop-down menu
                cy.get('#channelHeaderTitle').click();

                // * The dropdown menu of the channel header should be visible;
                cy.get('.Menu__content').should('be.visible');

                // * The dropdown menu of the channel header should have 3 dividers;
                cy.get('.Menu__content').find('.menu-divider:visible').should('have.lengthOf', 3);

                // # Demote the user to guest
                cy.get('@newuser').then((user) => {
                    demoteUserToGuest(user);
                });

                // * The dropdown menu of the channel header should have 2 dividers because some options have disappeared;
                cy.get('.Menu__content').find('.menu-divider:visible').should('have.lengthOf', 2);

                // # Promote the guest to user again
                cy.get('@newuser').then((user) => {
                    promoteGuestToUser(user);
                });

                // * The dropdown menu of the channel header should have 3 dividers again;
                cy.get('.Menu__content').find('.menu-divider:visible').should('have.lengthOf', 3);
            });
        });
    });
});
