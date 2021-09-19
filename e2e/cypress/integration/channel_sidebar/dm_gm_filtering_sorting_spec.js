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

describe('DM/GM filtering and sorting', () => {
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

    it('MM-T2003 Number of direct messages to show', () => {
        const receivingUser = testUser;

        // * Verify that we can see the sidebar
        cy.uiGetLHSHeader();

        // # Collapse the DM category (so that we can check all unread DMs quickly without the sidebar scrolling being an issue)
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

                    // * Verify that the DM count is now correct
                    cy.get('.SidebarChannelGroup:contains(DIRECT MESSAGES) a[id^="sidebarItem"]').should('have.length', Math.min(i + 1, 20));

                    // # Click on the new DM channel to mark it read
                    cy.get(`#sidebarItem_${channel.name}`).should('be.visible').click();
                });
            });
        }

        // # Expand the DM category (so that we can check all unread DMs quickly without the sidebar scrolling being an issue)
        cy.get('button.SidebarChannelGroupHeader_groupButton:contains(DIRECT MESSAGES)').should('be.visible').click();

        // * Verify that there are 20 DMs shown in the sidebar
        cy.get('.SidebarChannelGroup:contains(DIRECT MESSAGES) a[id^="sidebarItem"]').should('have.length', 20);

        // # Go to Sidebar Settings
        cy.uiOpenSettingsModal('Sidebar');

        // * Verify that the default setting for DMs shown is 20
        cy.get('#limitVisibleGMsDMsDesc').should('be.visible').should('contain', '20');

        // # Click Edit
        cy.get('#limitVisibleGMsDMsEdit').should('be.visible').click();

        // # Change the value to All Direct Messages
        cy.get('#limitVisibleGMsDMs').should('be.visible').click();
        cy.get('.react-select__option:contains(All Direct Messages)').should('be.visible').click();

        // # Save and close Account Settings
        cy.uiSaveAndClose();

        // * Verify that there are 41 DMs shown in the sidebar
        cy.get('.SidebarChannelGroup:contains(DIRECT MESSAGES) a[id^="sidebarItem"]').should('have.length', 41);

        // # Go to Sidebar Settings
        cy.uiOpenSettingsModal('Sidebar');

        // # Click Edit
        cy.get('#limitVisibleGMsDMsEdit').should('be.visible').click();

        // # Change the value to 10
        cy.get('#limitVisibleGMsDMs').should('be.visible').click();
        cy.get('.react-select__option:contains(10)').should('be.visible').click();

        // # Save and close Account Settings
        cy.uiSaveAndClose();

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
