// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @profile_popover

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Profile popover', () => {
    let testTeam;
    let testUser;
    let otherUser;

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;
            testUser = user;
            cy.apiCreateUser().then(({user: secondUser}) => {
                otherUser = secondUser;
                cy.apiAddUserToTeam(testTeam.id, secondUser.id);
            });
        });
    });

    it('MM-T2 Add user — Error if already in channel', () => {
        // # Do the system console setup
        cy.apiAdminLogin();
        cy.visit('/admin_console/user_management/permissions/system_scheme');
        cy.findByTestId('all_users-public_channel-checkbox').scrollIntoView().should('be.visible').click();

        // Expand the section
        cy.get('#all_users-public_channel > .fa').should('be.visible').click();

        // * Verify that all the sub-checkboxes are enabled
        cy.findByTestId('all_users-public_channel-create_public_channel-checkbox').should('have.class', 'checked');
        cy.findByTestId('all_users-public_channel-manage_public_channel_properties-checkbox').should('have.class', 'checked');
        cy.findByTestId('all_users-public_channel-manage_public_channel_members_and_read_groups-checkbox').should('have.class', 'checked');
        cy.findByTestId('all_users-public_channel-delete_public_channel-checkbox').should('have.class', 'checked');

        cy.findByTestId('all_users-private_channel-checkbox').scrollIntoView().should('be.visible').click();

        // Expand the section
        cy.get('#all_users-private_channel > .fa').should('be.visible').click();

        // * Verify that all the sub-checkboxes are enabled
        cy.findByTestId('all_users-private_channel-create_private_channel-checkbox').should('have.class', 'checked');
        cy.findByTestId('all_users-private_channel-manage_private_channel_properties-checkbox').should('have.class', 'checked');
        cy.findByTestId('all_users-private_channel-manage_private_channel_members_and_read_groups-checkbox').should('have.class', 'checked');
        cy.findByTestId('all_users-private_channel-delete_private_channel-checkbox').should('have.class', 'checked');

        cy.findByTestId('saveSetting').should('be.visible').click();

        cy.apiLogout();

        // # Login as test user and go to town square
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Send multiple messages so that the profile popover appears completely.
        cy.postMessage('Hi there\nsending\na\nmessage');
        cy.apiLogout();

        // # Login as the second user now
        cy.apiLogin(otherUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Open profile popover
        cy.get('#postListContent').within(() => {
            cy.findAllByText(testUser.username).first().should('have.text', testUser.username).click();
        });

        // # Add to a Channel
        cy.findByText('Add to a Channel').should('be.visible').click();

        cy.get('div[aria-labelledby="addChannelModalLabel"]').within(() => {
            // Type "Town" and press enter.
            cy.get('input').should('be.visible').type('Town').wait(TIMEOUTS.HALF_SEC).type('{enter}');

            // * Verify error message
            cy.get('#add-user-to-channel-modal__user-is-member').should('have.text', `${testUser.first_name} ${testUser.last_name} is already a member of that channel`);

            // * And verify that button is disabled
            cy.get('#add-user-to-channel-modal__add-button').should('be.disabled');
        });
    });
});
