// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. #. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @guest_account

/**
 * Note: This test requires Enterprise license to be uploaded
 */
import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Guest Account - Guest User Badge and Popover', () => {
    let regularUser;
    let guest;
    let testTeam;
    let testChannel;

    before(() => {
        // * Check if server has license for Guest Accounts
        cy.apiRequireLicenseForFeature('GuestAccounts');

        // # Enable Guest Account Settings
        cy.apiUpdateConfig({
            GuestAccountsSettings: {
                Enable: true,
            },
            ServiceSettings: {
                EnableEmailInvitations: true,
                EnableLegacySidebar: true,
            },
        });

        cy.apiInitSetup().then(({team, channel, user}) => {
            regularUser = user;
            testTeam = team;
            testChannel = channel;

            cy.apiCreateGuestUser().then(({guest: guestUser}) => {
                guest = guestUser;
                cy.log(`Guest Id: ${guest.id}`);
                cy.log(`Gurest Username ${guest.username}`);
                cy.apiAddUserToTeam(testTeam.id, guest.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, guest.id);
                });
            });

            // # Login as regular user and go to town square
            cy.apiLogin(regularUser);
            cy.visit(`/${team.name}/channels/${testChannel.name}`);
        });
    });

    it('MM-T1371 User profile popover shows guest badge', () => {
        // # Post a day old message
        cy.postMessageAs({sender: guest, message: 'Hello from yesterday', channelId: testChannel.id}).
            its('id').
            should('exist').
            as('yesterdaysPost');

        // * Verify Guest Badge when guest user posts a message in Center Channel
        cy.get('@yesterdaysPost').then((postId) => {
            cy.get(`#post_${postId}`).within(($el) => {
                cy.wrap($el).find('.post__header .Badge').should('be.visible');
                cy.wrap($el).find('.post__header .user-popover').should('be.visible').click().wait(TIMEOUTS.HALF_SEC);
            });
        });
    });
});
