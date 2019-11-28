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

let guest;

describe('Guest Account - Guest User Experience', () => {
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

        // # Login as a guest user and go to /
        cy.loginAsNewGuestUser().then((userResponse) => {
            guest = userResponse;
            cy.visit('/');
        });
    });

    it('MM-18043 Verify Guest User Restrictions', () => {
        // *Verify Reduced Options in Main Menu
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        const missingMainOptions = ['#invitePeople', '#teamSettings', '#manageMembers', '#createTeam', '#joinTeam', '#integrations', '#systemConsole'];
        const includeMainOptions = ['#accountSettings', '#viewMembers', '#leaveTeam'];
        missingMainOptions.forEach((missingOption) => {
            cy.get(missingOption).should('not.exist');
        });
        includeMainOptions.forEach((includeOption) => {
            cy.get(includeOption).should('be.visible');
        });

        // *Verify Reduced Options in LHS
        const missingLHSOptions = ['#createPublicChannel', "li[data-testid='morePublicButton']", '#createPrivateChannel'];
        missingLHSOptions.forEach((missingOption) => {
            cy.get(missingOption).should('not.exist');
        });

        // * Verify Guest Badge in Channel Header
        cy.get('#sidebarItem_town-square').click({force: true});
        cy.get('#channelHeaderDescription').within(($el) => {
            cy.wrap($el).find('.has-guest-header').should('be.visible').and('have.text', 'This channel has guests');
        });

        // * Verify list of Users and Guest Badge in Channel Members List
        cy.get('#member_popover').click();
        cy.get('#member-list-popover').should('be.visible').within(($el) => {
            cy.wrap($el).findAllByTestId('popoverListMembersItem').should('have.length', 2).each(($elChild) => {
                cy.wrap($elChild).invoke('attr', 'aria-label').then((username) => {
                    if (username === guest.username) {
                        cy.wrap($elChild).find('.Badge').should('be.visible').and('have.text', 'GUEST');
                    }
                });
            });
        });

        // #Close the Channel Members Popover
        cy.get('#member_popover').click();

        // * Verify list of Users in Direct Messages Dialog
        cy.get('#addDirectChannel').click().wait(TIMEOUTS.SMALL);
        cy.get('#multiSelectList').should('be.visible').within(($el) => {
            // * Verify only 2 users - Current User and Sysadmin is listed
            cy.wrap($el).children().should('have.length', 2);
        });
        cy.get('.modal-header .close').click();

        // * Verify Guest Badge when guest user posts a message
        cy.get('#sidebarItem_town-square').click({force: true});
        cy.postMessage('testing');
        cy.getLastPostId().then((postId) => {
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

        // * Verify Guest User can see only 2 channels in LHS
        cy.get('#publicChannelList').find('a').should('have.length', 2);

        // * Verify list of Users a Guest User can see in Team Members dialog
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#viewMembers').click().wait(TIMEOUTS.SMALL);
        cy.get('#searchableUserListTotal').should('be.visible').and('have.text', '1 - 2 members of 2 total');
    });

    it('MM-18049 Verify Guest User Restrictions is removed when promoted', () => {
        // # Reload the page to close any popups
        cy.reload();

        // # Promote a Guest user to a member and reload
        cy.promoteUser(guest.id);

        // *Verify Options in Main Menu are changed
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        const includeMainOptions = ['#accountSettings', '#viewMembers', '#leaveTeam', '#invitePeople', '#createTeam'];
        includeMainOptions.forEach((includeOption) => {
            cy.get(includeOption).should('be.visible');
        });

        // # Close the main menu
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();

        // *Verify Options in LHS are changed
        const missingLHSOptions = ['#createPublicChannel', "li[data-testid='morePublicButton']", '#createPrivateChannel'];
        missingLHSOptions.forEach((missingOption) => {
            cy.get(missingOption).should('be.visible');
        });

        // * Verify Guest Badge in Channel Header is removed
        cy.get('#sidebarItem_town-square').click({force: true});
        cy.get('#channelHeaderDescription').within(($el) => {
            cy.wrap($el).find('.has-guest-header').should('not.exist');
        });

        // * Verify Guest Badge is removed in Channel Members List
        cy.get('#member_popover').click();
        cy.get('#member-list-popover').should('be.visible').within(($el) => {
            cy.wrap($el).findAllByTestId('popoverListMembersItem').should('have.length', 2).each(($elChild) => {
                cy.wrap($elChild).invoke('attr', 'aria-label').then((username) => {
                    if (username === guest.username) {
                        cy.wrap($elChild).find('.Badge').should('not.exist');
                    }
                });
            });
        });

        // #Close the Channel Members Popover
        cy.get('#member_popover').click();

        // * Verify Guest Badge is removed when user posts a message
        cy.get('#sidebarItem_town-square').click({force: true});
        cy.postMessage('testing');
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).within(($el) => {
                cy.wrap($el).find('.post__header .Badge').should('not.exist');
                cy.wrap($el).find('.post__header .user-popover').should('be.visible').click().wait(TIMEOUTS.TINY);
            });
        });

        // * Verify Guest Badge is not displayed in User's Profile Popover
        cy.get('#user-profile-popover').should('be.visible').within(($el) => {
            cy.wrap($el).find('.user-popover__role').should('not.exist');
        });

        // # Close the profile popover
        cy.get('#channel-header').click();
    });
});
