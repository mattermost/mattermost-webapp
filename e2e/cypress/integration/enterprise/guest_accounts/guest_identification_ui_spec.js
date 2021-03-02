// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. #. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @guest_account

/**
 * Note: This test requires Enterprise license to be uploaded
 */
import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('MM-18045 Verify Guest User Identification in different screens', () => {
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
            },
        });

        cy.apiInitSetup().then(({team, channel, user}) => {
            regularUser = user;
            testTeam = team;
            testChannel = channel;

            cy.apiCreateGuestUser().then(({guest: guestUser}) => {
                guest = guestUser;
                cy.apiAddUserToTeam(testTeam.id, guest.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, guest.id);
                });
            });

            // # Login as regular user and go to town square
            cy.apiLogin(regularUser);
            cy.visit(`/${team.name}/channels/${testChannel.name}`);
        });
    });

    it('MM-T1370 Verify Guest Badge in Channel Members dropdown and dialog', () => {
        cy.get('#sidebarItem_town-square').click({force: true});

        // # Open Channel Members List
        cy.get('#member_popover').click();
        cy.get('#member-list-popover').should('be.visible').within(($el) => {
            cy.wrap($el).findAllByTestId('popoverListMembersItem').each(($elChild) => {
                cy.wrap($elChild).invoke('attr', 'aria-label').then((username) => {
                    if (username === guest.username) {
                        // * Verify Guest Badge in Channel Members List
                        cy.wrap($elChild).find('.Badge').should('be.visible').and('have.text', 'GUEST');
                    }
                });
            });
        });

        // # Open Channel Members Dialog
        cy.get('#channelHeaderDropdownIcon').click();
        cy.get('#channelViewMembers').click().wait(TIMEOUTS.HALF_SEC);
        cy.get('#channelMembersModal').should('be.visible').within(($el) => {
            cy.wrap($el).findAllByTestId('userListItemDetails').each(($elChild) => {
                cy.wrap($elChild).invoke('text').then((username) => {
                    // * Verify Guest Badge in Channel Members List
                    if (username === guest.username) {
                        cy.wrap($elChild).find('.Badge').should('be.visible').and('have.text', 'GUEST');
                    }
                });
            });

            // #Close Channel Members Dialog
            cy.wrap($el).find('.close').click();
        });
    });

    it('Verify Guest Badge in Team Members dialog', () => {
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#viewMembers').click().wait(TIMEOUTS.FIVE_SEC);
        cy.get('#teamMembersModal').should('be.visible').within(($el) => {
            cy.wrap($el).findAllByTestId('userListItemDetails').each(($elChild) => {
                cy.wrap($elChild).invoke('text').then((username) => {
                    // * Verify Guest Badge in Channel Members List
                    if (username === guest.username) {
                        cy.wrap($elChild).find('.Badge').should('be.visible').and('have.text', 'GUEST');
                    }
                });
            });

            // #Close Channel Members Dialog
            cy.wrap($el).find('.close').click();
        });
    });

    it('MM-T1372 Verify Guest Badge in Posts in Center Channel, RHS and User Profile Popovers', () => {
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Get yesterdays date in UTC
        const yesterdaysDate = Cypress.moment().subtract(1, 'days').valueOf();

        // # Post a day old message
        cy.postMessageAs({sender: guest, message: 'Hello from yesterday', channelId: testChannel.id, createAt: yesterdaysDate}).
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

        // * Verify Guest Badge in Guest User's Profile Popover
        cy.get('#user-profile-popover').should('be.visible').within(($el) => {
            cy.wrap($el).find('.user-popover__role').should('be.visible').and('have.text', 'GUEST');
        });

        // # Close the profile popover
        cy.get('#channel-header').click();

        // # Open RHS comment menu
        cy.get('@yesterdaysPost').then((postId) => {
            cy.clickPostCommentIcon(postId);

            // * Verify Guest Badge in RHS
            cy.get(`#rhsPost_${postId}`).within(($el) => {
                cy.wrap($el).find('.post__header .Badge').should('be.visible');
            });

            // # Close RHS
            cy.closeRHS();
        });
    });

    it('Verify Guest Badge in Switch Channel Dialog', () => {
        // # Click the sidebar switcher button
        cy.uiGetChannelSwitcher().click();

        // # Type the guest user name on Channel switcher input
        cy.findByRole('textbox', {name: 'quick switch input'}).type(guest.username).wait(TIMEOUTS.HALF_SEC);

        // * Verify if Guest badge is displayed for the guest user in the Switch Channel Dialog
        cy.get('#suggestionList').should('be.visible');
        cy.findByTestId(guest.username).within(($el) => {
            cy.wrap($el).find('.Badge').should('be.visible').and('have.text', 'GUEST');
        });

        // # Close Dialog
        cy.get('#quickSwitchModalLabel > .close').click();
    });

    it('MM-T1377 Verify Guest Badge in DM Search dialog', () => {
        // #Click on plus icon of Direct Messages
        cy.uiAddDirectMessage().click().wait(TIMEOUTS.HALF_SEC);

        // # Search for the Guest User
        cy.focused().type(guest.username, {force: true}).wait(TIMEOUTS.HALF_SEC);
        cy.get('#multiSelectList').should('be.visible').within(($el) => {
            // * Verify if Guest badge is displayed in the DM Search
            cy.wrap($el).find('.Badge').should('be.visible').and('have.text', 'GUEST');
        });

        // # Close the Direct Messages dialog
        cy.get('#moreDmModal .close').click();
    });

    it('Verify Guest Badge in DM header and GM header', () => {
        // # Open a DM with Guest User
        cy.uiAddDirectMessage().click().wait(TIMEOUTS.HALF_SEC);
        cy.focused().type(guest.username, {force: true}).type('{enter}', {force: true}).wait(TIMEOUTS.HALF_SEC);
        cy.get('#saveItems').click().wait(TIMEOUTS.HALF_SEC);

        // * Verify Guest Badge in DM header
        cy.get('#channelHeaderTitle').should('be.visible').find('.Badge').should('be.visible').and('have.text', 'GUEST');
        cy.get('#channelHeaderDescription').within(($el) => {
            cy.wrap($el).find('.has-guest-header').should('be.visible').and('have.text', 'This channel has guests');
        });

        // # Open a GM with Guest User and Sysadmin
        cy.uiAddDirectMessage().click().wait(TIMEOUTS.HALF_SEC);
        cy.focused().type(guest.username, {force: true}).type('{enter}', {force: true}).wait(TIMEOUTS.HALF_SEC);
        cy.get('#saveItems').click().wait(TIMEOUTS.HALF_SEC);

        // * Verify Guest Badge in GM header
        cy.get('#channelHeaderTitle').should('be.visible').find('.Badge').should('be.visible').and('have.text', 'GUEST');
        cy.get('#channelHeaderDescription').within(($el) => {
            cy.wrap($el).find('.has-guest-header').should('be.visible').and('have.text', 'This channel has guests');
        });
    });

    it('Verify Guest Badge in @mentions Autocomplete', () => {
        // # Start a draft in Channel containing "@user"
        cy.get('#post_textbox').type(`@${guest.username}`);

        // * Verify Guest Badge is displayed at mention auto-complete
        cy.get('#suggestionList').should('be.visible');
        cy.findByTestId(`mentionSuggestion_${guest.username}`).within(($el) => {
            cy.wrap($el).find('.Badge').should('be.visible').and('have.text', 'GUEST');
        });
    });

    it('Verify Guest Badge not displayed in Search Autocomplete', () => {
        // # Search for the Guest User
        cy.get('#searchBox').type('from:');

        // * Verify Guest Badge is not displayed at Search auto-complete
        cy.get('#search-autocomplete__popover').should('be.visible');
        cy.contains('.search-autocomplete__item', guest.username).scrollIntoView().should('be.visible').within(($el) => {
            cy.wrap($el).find('.Badge').should('not.exist');
        });

        // # Close and Clear the Search Autocomplete
        cy.get('#searchFormContainer').find('.input-clear-x').click({force: true});
    });

    it('MM-T1419 Deactivating a Guest removes "This channel has guests" message from channel header', () => {
        // Visit the channel which has guests
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // * Verify the text 'This channel has guests' is displayed in the header
        cy.get('#channelHeaderDescription').within(($el) => {
            cy.wrap($el).find('.has-guest-header').should('be.visible').and('have.text', 'This channel has guests');
        });

        // # Deactivate Guest user
        cy.externalActivateUser(guest.id, false).wait(TIMEOUTS.FIVE_SEC);

        // * Verify the text 'This channel has guests' is removed from the header
        cy.get('#channelHeaderDescription').within(($el) => {
            cy.wrap($el).find('.has-guest-header').should('not.exist');
        });
    });
});
