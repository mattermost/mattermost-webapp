// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. #. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/**
 * Note: This test requires Enterprise license to be uploaded
 */
import * as TIMEOUTS from '../../../fixtures/timeouts';
import users from '../../../fixtures/users.json';

const user1 = users['user-1'];
let guest;
let guestTeamId;

describe('MM-18045 Verify Guest User Identification in different screens', () => {
    before(() => {
        // # Enable Guest Account Settings
        cy.apiUpdateConfig({
            GuestAccountsSettings: {
                Enable: true,
            },
            ServiceSettings: {
                EnableEmailInvitations: true,
            },
        });

        // # Create a Guest Team and login as Guest User
        cy.loginAsNewGuestUser().then((userResponse) => {
            guest = userResponse;
            cy.getCurrentTeamId().then((teamId) => {
                guestTeamId = teamId;

                // # Login as Sysadmin and add a regular member to Guest Team
                cy.apiLogin('sysadmin');
                cy.apiGetUserByEmail(user1.email).then((emailResponse) => {
                    const user = emailResponse.body;
                    cy.apiAddUserToTeam(guestTeamId, user.id);
                });

                // # Login as user1
                cy.apiLogin('user-1');
                cy.apiGetTeam(teamId).then((teamResponse) => {
                    const team = teamResponse.body;
                    cy.visit(`/${team.name}`);
                });
            });
        });
    });

    after(() => {
        // # Delete the new team as sysadmin
        if (guestTeamId) {
            cy.apiLogin('sysadmin');
            cy.apiDeleteTeam(guestTeamId);
        }
    });

    it('Verify Guest Badge in Channel Members dropdown and dialog', () => {
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
        cy.get('#channelViewMembers').click().wait(TIMEOUTS.TINY);
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
        cy.get('#viewMembers').click().wait(TIMEOUTS.SMALL);
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

    it('Verify Guest Badge in Posts in Center Channel, RHS and User Profile Popovers', () => {
        // # Submit a post as a Guest User
        cy.getCurrentChannelId().then((channelId) => {
            // # Get yesterdays date in UTC
            const yesterdaysDate = Cypress.moment().subtract(1, 'days').valueOf();

            // # Post a day old message
            cy.postMessageAs({sender: guest, message: 'Hello from yesterday', channelId, createAt: yesterdaysDate}).
                its('id').
                should('exist').
                as('yesterdaysPost');

            // * Verify Guest Badge when guest user posts a message in Center Channel
            cy.get('@yesterdaysPost').then((postId) => {
                cy.get(`#post_${postId}`).within(($el) => {
                    cy.wrap($el).find('.post__header .Badge').should('be.visible');
                    cy.wrap($el).find('.post__header .user-popover').should('be.visible').click().wait(TIMEOUTS.TINY);
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
    });

    it('Verify Guest Badge in Switch Channel Dialog', () => {
        // # Click the sidebar switcher button
        cy.get('#sidebarSwitcherButton').click();

        // # Type the guest user name on Channel switcher input
        cy.get('#quickSwitchInput').type(guest.username).wait(TIMEOUTS.TINY);

        // * Verify if Guest badge is displayed for the guest user in the Switch Channel Dialog
        cy.get('#suggestionList').should('be.visible');
        cy.findByTestId(guest.username).within(($el) => {
            cy.wrap($el).find('.Badge').should('be.visible').and('have.text', 'GUEST');
        });

        // # Close Dialog
        cy.get('#quickSwitchModalLabel > .close').click();
    });

    it('Verify Guest Badge in DM Search dialog', () => {
        // #Click on plus icon of Direct Messages
        cy.get('#addDirectChannel').click().wait(TIMEOUTS.TINY);

        // # Search for the Guest User
        cy.focused().type(guest.username, {force: true}).wait(TIMEOUTS.TINY);
        cy.get('#multiSelectList').should('be.visible').within(($el) => {
            // * Verify if Guest badge is displayed in the DM Search
            cy.wrap($el).find('.Badge').should('be.visible').and('have.text', 'GUEST');
        });

        // # Close the Direct Messages dialog
        cy.get('#moreDmModal .close').click();
    });

    it('Verify Guest Badge in DM header and GM header', () => {
        // # Open a DM with Guest User
        cy.get('#addDirectChannel').click().wait(TIMEOUTS.TINY);
        cy.focused().type(guest.username, {force: true}).type('{enter}', {force: true}).wait(TIMEOUTS.TINY);
        cy.get('#saveItems').click().wait(TIMEOUTS.TINY);

        // * Verify Guest Badge in DM header
        cy.get('#channelHeaderTitle').should('be.visible').find('.Badge').should('be.visible').and('have.text', 'GUEST');
        cy.get('#channelHeaderDescription').within(($el) => {
            cy.wrap($el).find('.has-guest-header').should('be.visible').and('have.text', 'This channel has guests');
        });

        // # Open a GM with Guest User and Sysadmin
        cy.get('#addDirectChannel').click().wait(TIMEOUTS.TINY);
        cy.focused().type(guest.username, {force: true}).type('{enter}', {force: true}).wait(TIMEOUTS.TINY);
        cy.focused().type('sysadmin', {force: true}).type('{enter}', {force: true}).wait(TIMEOUTS.TINY);
        cy.get('#saveItems').click().wait(TIMEOUTS.TINY);

        // * Verify Guest Badge in GM header
        cy.get('#channelHeaderTitle').should('be.visible').find('.Badge').should('be.visible').and('have.text', 'GUEST');
        cy.get('#channelHeaderDescription').within(($el) => {
            cy.wrap($el).find('.has-guest-header').should('be.visible').and('have.text', 'This group message has guests');
        });
    });

    it('Verify Guest Badge in @mentions Autocomplete', () => {
        // # Start a draft in Channel containing "@user"
        cy.get('#post_textbox').type('@user');

        // * Verify Guest Badge is displayed at mention auto-complete
        cy.get('#suggestionList').should('be.visible');
        cy.findByTestId(`mentionSuggestion_${guest.username}`).within(($el) => {
            cy.wrap($el).find('.Badge').should('be.visible').and('have.text', 'GUEST');
        });
    });

    it('Verify Guest Badge not displayed in Search Autocomplete', () => {
        // # Search for the Guest User
        cy.get('#searchBox').type('from:user');

        // * Verify Guest Badge is not displayed at Search auto-complete
        cy.get('#search-autocomplete__popover').should('be.visible');
        cy.contains('.search-autocomplete__item', guest.username).scrollIntoView().should('be.visible').within(($el) => {
            cy.wrap($el).find('.Badge').should('not.exist');
        });

        // # Close and Clear the Search Autocomplete
        cy.get('#searchFormContainer').find('.input-clear-x').click({force: true});
    });
});
