// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @dm_category

import {getAdminAccount} from '../../support/env';
import * as TIMEOUTS from '../../fixtures/timeouts';

describe('DM category', () => {
    const sysadmin = getAdminAccount();
    let testUser;
    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team, user}) => {
            testUser = user;
            cy.visit(`/${team.name}/channels/town-square`);

            // # upgrade user to sys admin role
            cy.externalRequest({user: sysadmin, method: 'put', path: `users/${user.id}/roles`, data: {roles: 'system_user system_admin'}});
        });
    });

    it('MM-T2016_1 Opening a new DM should make sure the DM appears in the sidebar', () => {
        // # Create a new user to start a DM with
        cy.apiCreateUser().then(({user}) => {
            // * Verify that we can see the sidebar
            cy.get('#headerTeamName').should('be.visible');

            // # Click the + button next to the DM category
            cy.get('.SidebarChannelGroupHeader_addButton').should('be.visible').click();

            // # Search for the new user's username
            cy.get('#selectItems input').
                type(user.username, {force: true}).
                wait(TIMEOUTS.HALF_SEC);

            // # Select the user you searched for
            cy.get(`#displayedUserName${user.username}`).click().wait(TIMEOUTS.HALF_SEC);

            // # Click Go
            cy.findByTestId('saveSetting').should('be.visible').click();

            // * Verify that a DM channel shows up in the sidebar
            cy.get(`.SidebarLink:contains(${user.username})`).should('be.visible');
        });
    });

    it('MM-T2016_2 Opening a new DM with a bot should make sure the DM appears in the sidebar, and the bot icon should be present', () => {
        // # Create a new user to start a DM with
        cy.apiCreateBot().then(({bot}) => {
            // * Verify that we can see the sidebar
            cy.get('#headerTeamName').should('be.visible');

            // * Verify that a DM channel shows up in the sidebar
            cy.get(`.SidebarLink:contains(${bot.username})`).should('be.visible');

            // * Verify bot icon appears
            cy.get(`.SidebarLink:contains(${bot.username})`).within(() => {
                cy.get('i.icon-robot-happy').should('be.visible');
            });
        });
    });

    it('MM-T2016_3 Receiving a DM from a user should show the DM in the sidebar', () => {
        // # Create a new user to start a DM with
        cy.apiCreateUser().then(({user}) => {
            cy.apiCreateDirectChannel([testUser.id, user.id]).then(({channel}) => {
                // * Verify that we can see the sidebar
                cy.get('#headerTeamName').should('be.visible');

                // # Post a message as the new user
                cy.postMessageAs({
                    sender: user,
                    message: `Hey ${testUser.username}`,
                    channelId: channel.id,
                });

                // * Verify that a DM channel shows up in the sidebar
                cy.get(`.SidebarLink:contains(${user.username})`).should('be.visible').click();

                // # Close the new DM
                cy.get('#channelHeaderDropdownButton').click();
                cy.get('#channelCloseMessage').click();

                // * Verify that the DM channel disappears
                cy.get(`.SidebarLink:contains(${user.username})`).should('not.be.visible');

                // # Post a message as the new user again
                cy.postMessageAs({
                    sender: user,
                    message: `Hello ${testUser.username}`,
                    channelId: channel.id,
                });

                // * Verify that the DM channel re-appears in the sidebar
                cy.get(`.SidebarLink:contains(${user.username})`).should('be.visible');
            });
        });
    });

    it('MM-T2017_1 Opening a new GM should make sure the GM appears in the sidebar', () => {
        // # Create 2 new users to start a GM with
        cy.apiCreateUser().then(({user}) => {
            cy.apiCreateUser().then(({user: user2}) => {
                // * Verify that we can see the sidebar
                cy.get('#headerTeamName').should('be.visible');

                // # Click the + button next to the DM category
                cy.get('.SidebarChannelGroupHeader_addButton').should('be.visible').click();

                // # Search for the new user's username
                cy.get('#selectItems input').
                    type(user.username, {force: true}).
                    wait(TIMEOUTS.HALF_SEC);

                // # Select the user you searched for
                cy.get(`#displayedUserName${user.username}`).click().wait(TIMEOUTS.HALF_SEC);

                // # Search for the 2nd user's username
                cy.get('#selectItems input').
                    type(user2.username, {force: true}).
                    wait(TIMEOUTS.HALF_SEC);

                // # Select the user you searched for
                cy.get(`#displayedUserName${user2.username}`).click().wait(TIMEOUTS.HALF_SEC);

                // # Click Go
                cy.findByTestId('saveSetting').should('be.visible').click();

                // * Verify that a GM channel shows up in the sidebar
                cy.get(`.SidebarLink:contains(${user.username})`).should('contain', user2.username).should('be.visible');
            });
        });
    });

    it('MM-T2017_2 Receiving a DM from a user should show the DM in the sidebar', () => {
        // # Create 2 new users to start a GM with
        cy.apiCreateUser().then(({user}) => {
            cy.apiCreateUser().then(({user: user2}) => {
                cy.apiCreateGroupChannel([testUser.id, user.id, user2.id]).then(({channel}) => {
                    // * Verify that we can see the sidebar
                    cy.get('#headerTeamName').should('be.visible');

                    // # Post a message as the new user
                    cy.postMessageAs({
                        sender: user,
                        message: `Hey ${testUser.username}`,
                        channelId: channel.id,
                    });

                    // * Verify that a GM channel shows up in the sidebar
                    cy.get(`#sidebarItem_${channel.name}`).should('be.visible').click();

                    // # Close the new GM
                    cy.get('#channelHeaderDropdownButton').click();
                    cy.get('#channelCloseMessage').click();

                    // * Verify that the GM channel disappears
                    cy.get(`.SidebarLink:contains(${user.username})`).should('not.be.visible');

                    // # Post a message as the new user again
                    cy.postMessageAs({
                        sender: user,
                        message: `Hello ${testUser.username}`,
                        channelId: channel.id,
                    });

                    // * Verify that the DM channel re-appears in the sidebar
                    cy.get(`#sidebarItem_${channel.name}`).should('be.visible');
                });
            });
        });
    });

    it('MM-T2017_3 Should not double already open GMs in a custom category', () => {
        // # Create 2 new users to start a GM with
        cy.apiCreateUser().then(({user}) => {
            cy.apiCreateUser().then(({user: user2}) => {
                cy.apiCreateGroupChannel([testUser.id, user.id, user2.id]).then(({channel}) => {
                    // * Verify that we can see the sidebar
                    cy.get('#headerTeamName').should('be.visible');

                    // # Post a message as the new user
                    cy.postMessageAs({
                        sender: user,
                        message: `Hey ${testUser.username}`,
                        channelId: channel.id,
                    });

                    // * Verify that a GM channel shows up in the sidebar
                    cy.get(`#sidebarItem_${channel.name}`).should('be.visible').click();

                    // # Move the GM to a custom category
                    cy.get(`#sidebarItem_${channel.name}`).find('.SidebarMenu_menuButton').click({force: true});
                    cy.get(`#moveTo-${channel.id}_menuitem`).trigger('mouseover');
                    cy.get(`#moveToNewCategory-${channel.id}_menuitem`).click();

                    // # Enter new category name and Save
                    cy.get('.GenericModal__body input').should('be.visible').type(`Category ${user.username}`);
                    cy.get('.GenericModal__button.confirm').should('be.visible').click();

                    // * Verify that the GM has moved to a new category
                    cy.get(`.SidebarChannelGroup:contains(Category ${user.username})`).find(`#sidebarItem_${channel.name}`).should('be.visible');

                    // # Go to Town Square
                    cy.get('#sidebarItem_town-square').should('be.visible').click();

                    // * Verify we are now in town square
                    cy.url().should('include', '/channels/town-square');

                    // # Click the + button next to the DM category
                    cy.get('.SidebarChannelGroupHeader_addButton').should('be.visible').click();

                    // # Search for the new user's username
                    cy.get('#selectItems input').
                        type(user.username, {force: true}).
                        wait(TIMEOUTS.HALF_SEC);

                    // # Select the user you searched for
                    cy.get(`#displayedUserName${user.username}`).click().wait(TIMEOUTS.HALF_SEC);

                    // # Search for the 2nd user's username
                    cy.get('#selectItems input').
                        type(user2.username, {force: true}).
                        wait(TIMEOUTS.HALF_SEC);

                    // # Select the user you searched for
                    cy.get(`#displayedUserName${user2.username}`).click().wait(TIMEOUTS.HALF_SEC);

                    // # Click Go
                    cy.findByTestId('saveSetting').should('be.visible').click();

                    // * Verify that the GM is in the original category and that it hasn't duplicated in the DM category
                    cy.get(`.SidebarChannelGroup:contains(Category ${user.username})`).find(`#sidebarItem_${channel.name}`).should('be.visible');
                    cy.get('.SidebarChannelGroup:contains(DIRECT MESSAGES)').find(`#sidebarItem_${channel.name}`).should('not.be.visible');

                    // * Verify that we switched to the GM
                    cy.url().should('include', `/messages/${channel.name}`);
                });
            });
        });
    });

    it('MM-T2003 Number of direct messages to show', () => {
        const receivingUser = testUser;

        // * Verify that we can see the sidebar
        cy.get('#headerTeamName').should('be.visible');

        // # Collapse the DM category (so that we can check all unread DMs quickly without the sidebar scrolling beind an issue)
        cy.get('button.SidebarChannelGroupHeader_groupButton:contains(DIRECT MESSAGES)').should('be.visible').click();

        // # Create 41 DMs (ie. one over the max displayable read limit)
        for (let i = 0; i < 41; i++) {
            // # Create a new user to have a DM with
            cy.apiCreateUser().then(({user}) => {
                cy.apiCreateDirectChannel([receivingUser.id, user.id]).then(({channel}) => {
                    // # Post a message as the new user
                    cy.postMessageAs({
                        sender: user,
                        message: `Hey ${receivingUser.username}`,
                        channelId: channel.id,
                    });

                    // # Click on the new DM channel to mark it read
                    cy.get(`#sidebarItem_${channel.name}`).should('be.visible').click();
                });
            });
        }

        // # Expand the DM category (so that we can check all unread DMs quickly without the sidebar scrolling beind an issue)
        cy.get('button.SidebarChannelGroupHeader_groupButton:contains(DIRECT MESSAGES)').should('be.visible').click();

        // * Verify that there are 20 DMs shown in the sidebar
        cy.get('.SidebarChannelGroup:contains(DIRECT MESSAGES) a[id^="sidebarItem"]').should('have.length', 20);

        // # Go to Sidebar Settings
        navigateToSidebarSettings();

        // * Verify that the default setting for DMs shown is 20
        cy.get('#limitVisibleGMsDMsDesc').should('be.visible').should('contain', '20');

        // # Click Edit
        cy.get('#limitVisibleGMsDMsEdit').should('be.visible').click();

        // # Change the value to All Direct Messages
        cy.get('#limitVisibleGMsDMs').should('be.visible').click();
        cy.get('.react-select__option:contains(All Direct Messages)').should('be.visible').click();

        // # Click Save
        cy.get('#saveSetting').should('be.visible').click();

        // # Close Account Settings
        cy.get('#accountSettingsHeader > .close').click();

        // * Verify that there are 41 DMs shown in the sidebar
        cy.get('.SidebarChannelGroup:contains(DIRECT MESSAGES) a[id^="sidebarItem"]').should('have.length', 41);

        // # Go to Sidebar Settings
        navigateToSidebarSettings();

        // # Click Edit
        cy.get('#limitVisibleGMsDMsEdit').should('be.visible').click();

        // # Change the value to 10
        cy.get('#limitVisibleGMsDMs').should('be.visible').click();
        cy.get('.react-select__option:contains(10)').should('be.visible').click();

        // # Click Save
        cy.get('#saveSetting').should('be.visible').click();

        // # Close Account Settings
        cy.get('#accountSettingsHeader > .close').click();

        // * Verify that there are 10 DMs shown in the sidebar
        cy.get('.SidebarChannelGroup:contains(DIRECT MESSAGES) a[id^="sidebarItem"]').should('have.length', 10);
    });

    it('MM-T3832 DMs/GMs should not be removed from the sidebar when only viewed (no message)', () => {
        cy.apiCreateUser().then(({user}) => {
            cy.apiCreateDirectChannel([testUser.id, user.id]).then(({channel}) => {
                // # Post a message as the new user
                cy.postMessageAs({
                    sender: user,
                    message: `Hey ${testUser.username}`,
                    channelId: channel.id,
                });

                // # Click on the new DM channel to mark it read
                cy.get(`#sidebarItem_${channel.name}`).should('be.visible').click();

                // # Click on Town Square
                cy.get('.SidebarLink:contains(Town Square)').should('be.visible').click();

                // * Verify we're on Town Square
                cy.url().should('contain', 'town-square');

                // # Refresh the page
                cy.visit('/');

                // * Verify that the DM we just read remains in the sidebar
                cy.get(`#sidebarItem_${channel.name}`).should('be.visible');
            });
        });
    });
});

function navigateToSidebarSettings() {
    cy.get('#channel_view').should('be.visible');
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
    cy.get('#accountSettings').should('be.visible').click();
    cy.get('#accountSettingsModal').should('be.visible');

    cy.get('#sidebarButton').should('be.visible');
    cy.get('#sidebarButton').click();

    cy.get('#sidebarLi.active').should('be.visible');
    cy.get('#sidebarTitle > .tab-header').should('have.text', 'Sidebar Settings');
}
