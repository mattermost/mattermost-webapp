// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @system_console

import * as TIMEOUTS from '../../../fixtures/timeouts';
import * as MESSAGES from '../../../fixtures/messages';

describe('System Console > User Management > Deactivation', () => {
    let team1;

    before(() => {
        // # Do initial setup
        cy.apiInitSetup().then(({team}) => {
            team1 = team;
        });
    });

    beforeEach(() => {
        // # Visit town-square
        cy.visit(`/${team1.name}`);
    });

    // # Create two users
    it('MM-T946 GM: User deactivated in System Console still displays', () => {
        cy.apiCreateUser({prefix: 'first'}).then(({user: user1}) => {
            cy.apiCreateUser({prefix: 'second'}).then(({user: user2}) => {
                const message = MESSAGES.SMALL;

                // # Send a GM to them
                cy.sendDirectMessageToUsers([user1, user2], message);

                // * Verify names on the LHS are still ordered alphabetically
                cy.uiGetLhsSection('DIRECT MESSAGES').find('.active').should('contain', user1.username + ', ' + user2.username);

                // # Deactivate user 1
                cy.apiDeactivateUser(user1.id);

                // * Verify names on the LHS are still ordered alphabetically
                cy.uiGetLhsSection('DIRECT MESSAGES').find('.active').should('contain', user1.username + ', ' + user2.username);

                // # Search for the message send in the GM
                cy.uiSearchPosts(message);

                // * Verify GM message is returned in RHS
                cy.findAllByTestId('search-item-container').
                    should('be.visible').and('have.length', 1).
                    eq(0).should('contain', message);
            });
        });
    });

    it('MM-T948 DM posts searchable in DM More... and channel switcher DM channel re-openable', () => {
        cy.apiCreateUser({prefix: 'other'}).then(({user: other}) => {
            // # Open DM
            cy.sendDirectMessageToUser(other, MESSAGES.SMALL);

            // # Close DM
            cy.get('#channelHeaderDropdownIcon').click();
            cy.findByText('Close Direct Message').click();

            // # Deactivate the user
            cy.apiDeactivateUser(other.id);

            // # Open Channel Switcher
            cy.uiGetChannelSwitcher().click();

            // # Type the user name on Channel switcher input
            cy.get('#quickSwitchInput').type(other.username).wait(TIMEOUTS.HALF_SEC);

            // * Verify user is marked as deactivated
            cy.get('[data-testid="' + other.username + '"]').contains('Deactivated');

            // # Close Channel Switcher
            cy.uiClose();

            // # Open DM Modal
            cy.uiAddDirectMessage().click();

            // # Type the guest user name on Channel switcher input
            cy.get('.more-direct-channels #selectItems').type(other.username).wait(TIMEOUTS.HALF_SEC);

            // * Verify user is marked as deactivated
            cy.get('#displayedUserName' + other.username).parent().contains('Deactivated');

            // # Click on the user
            cy.get('#displayedUserName' + other.username).click();

            // * Confirm DM More... Modal is closed
            cy.get('#moreDmModal').should('not.be.visible');
        });
    });

    it('MM-T949 If an active user is selected in DM More... or channel switcher, deactivated users disappear so they can\'t be added to a GM together', () => {
        // # Create two users
        cy.apiCreateUser({prefix: 'first'}).then(({user: user1}) => {
            cy.apiCreateUser({prefix: 'second_'}).then(({user: user2}) => {
                // # Send a DM to user1 so they show up in the DM modal
                cy.sendDirectMessageToUser(user1, MESSAGES.SMALL);

                // # Send a DM to user2 so they show up in the DM modal
                cy.sendDirectMessageToUser(user2, MESSAGES.SMALL);

                // # Deactivate user 2
                cy.apiDeactivateUser(user2.id);

                // # Open DM Modal
                cy.uiAddDirectMessage().click().wait(TIMEOUTS.HALF_SEC);

                // # Type the user name of user1 on Channel switcher input
                cy.get('.more-direct-channels #selectItems').type(user1.username).wait(TIMEOUTS.HALF_SEC);

                // # Click on the user
                cy.get('#displayedUserName' + user1.username).click();

                // # Type the user name of user2 on Channel switcher input
                cy.get('.more-direct-channels #selectItems').type(user2.username).wait(TIMEOUTS.HALF_SEC);

                // * Confirm user2 can't be added to the DM
                cy.get('#displayedUserName' + user2.username).should('not.be.visible');
            });
        });
    });

    it('MM-T951 Reopened DM shows archived icon in LHS No status indicator in channel header Message box replaced with "You are viewing an archived channel with a deactivated user." in center and RHS', () => {
        // # Create other user
        cy.apiCreateUser({prefix: 'other'}).then(({user}) => {
            // # Send a DM to the other user
            cy.sendDirectMessageToUser(user, MESSAGES.SMALL);

            // # Open RHS
            cy.clickPostCommentIcon();

            // * Verify status indicator is shown in channel header
            cy.get('#channelHeaderDescription .status').should('be.visible');

            // # Deactivate other user
            cy.apiDeactivateUser(user.id);

            // * Verify center channel message box is replace with warning
            cy.get('.channel-archived__message').contains('You are viewing an archived channel with a deactivated user. New messages cannot be posted.');

            // * Verify RHS message box is replace with warning
            cy.get('#rhsContainer .post-create-message').contains('You are viewing an archived channel with a deactivated user. New messages cannot be posted.');

            // * Verify status indicator is not shown in channel header
            cy.get('#channelHeaderDescription .status').should('not.be.visible');

            // * Verify archived icon is shown in LHS
            cy.uiGetLhsSection('DIRECT MESSAGES').
                find('.active').should('be.visible').
                find('.icon-archive-outline').should('be.visible');
        });
    });
});
