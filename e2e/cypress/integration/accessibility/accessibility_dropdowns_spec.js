// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @accessibility

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Verify Accessibility Support in Dropdown Menus', () => {
    let testTeam;

    before(() => {
        cy.apiCreateCustomAdmin().then(({sysadmin}) => {
            cy.apiLogin(sysadmin);

            cy.apiInitSetup().then(({team}) => {
                testTeam = team;
            });

            cy.apiCreateTeam('other-team', 'Other Team');
        });
    });

    beforeEach(() => {
        // Visit the Off Topic channel
        cy.visit(`/${testTeam.name}/channels/off-topic`);
        cy.postMessage('hello');
    });

    it('MM-T1464 Accessibility Support in Channel Menu Dropdown', () => {
        // # Press tab from the Channel Favorite button
        cy.get('#toggleFavorite').focus().wait(TIMEOUTS.HALF_SEC).tab({shift: true}).tab().tab({shift: true});

        // * Verify the aria-label in channel menu button
        cy.get('#channelHeaderDropdownButton button').should('have.attr', 'aria-label', 'channel menu').and('have.class', 'a11y--active a11y--focused').click();

        // * Verify the accessibility support in the Channel Dropdown menu
        cy.get('#channelHeaderDropdownMenu').should('have.attr', 'aria-label', 'channel menu').and('have.class', 'a11y__popup').and('have.attr', 'role', 'menu');

        // * Verify the first option is not selected by default
        cy.get('#channelHeaderDropdownMenu .MenuItem').children().eq(0).should('not.have.class', 'a11y--active a11y--focused');

        // # Press tab
        cy.focused().tab();

        // * Verify the accessibility support in the Channel Dropdown menu items
        const menuItems = [
            {id: 'channelViewInfo', label: 'View Info dialog'},
            {id: 'channelNotificationPreferences', label: 'Notification Preferences dialog'},
            {id: 'channelToggleMuteChannel', text: 'Mute Channel'},
            {id: 'channelAddMembers', label: 'Add Members dialog'},
            {id: 'channelManageMembers', label: 'Manage Members dialog'},
            {id: 'channelEditHeader', label: 'Edit Channel Header dialog'},
            {id: 'channelEditPurpose', label: 'Edit Channel Purpose dialog'},
            {id: 'channelRename', label: 'Rename Channel dialog'},
            {id: 'channelConvertToPrivate', label: 'Convert to Private Channel dialog'},
            {id: 'channelArchiveChannel', label: 'Archive Channel dialog'},
            {id: 'channelLeaveChannel', text: 'Leave Channel'},
        ];

        menuItems.forEach((item) => {
            // * Verify that the menu item is focused
            cy.get('#channelHeaderDropdownMenu').find(`#${item.id}`).should('be.visible').within(() => {
                if (item.label) {
                    cy.findByLabelText(item.label).should('have.class', 'a11y--active a11y--focused');
                } else {
                    cy.findByText(item.text).parent().should('have.class', 'a11y--active a11y--focused');
                }
            });

            // # Press tab for next item
            cy.focused().tab();
        });

        // * Verify if menu is closed when we press Escape
        cy.get('body').type('{esc}', {force: true});
        cy.get('#channelHeaderDropdownMenu').should('not.exist');
    });

    it('MM-T1476 Accessibility Support in Main Menu Dropdown', () => {
        // # Open team menu
        cy.uiGetLHSHeader().click();

        // * Verify the accessibility support in the Main Menu Dropdown
        cy.findByRole('menu').
            should('exist').
            and('have.attr', 'aria-label', 'main menu').
            and('have.class', 'a11y__popup');

        // * Verify the first option is not selected by default
        cy.uiGetLHSTeamMenu().find('.MenuItem').
            children().eq(0).
            should('not.have.class', 'a11y--active a11y--focused').
            focus();

        // * Verify the accessibility support in the Main Menu Dropdown items
        const menuItems = [
            {id: 'invitePeople', label: 'Invite People dialog'},
            {id: 'teamSettings', label: 'Team Settings dialog'},
            {id: 'manageMembers', label: 'Manage Members dialog'},
            {id: 'joinTeam', text: 'Join Another Team'},
            {id: 'leaveTeam', label: 'Leave Team dialog'},
            {id: 'createTeam', text: 'Create a Team'},
        ];

        menuItems.forEach((item) => {
            // * Verify that the menu item is focused
            if (item.label) {
                cy.focused().should('have.attr', 'aria-label', item.label);
            } else {
                cy.focused().should('have.text', item.text);
            }

            // # Press tab for next item
            cy.focused().tab();
        });

        cy.uiGetLHSTeamMenu().find('.MenuItem').each((el) => {
            cy.wrap(el).should('have.attr', 'role', 'menuitem');
        });

        // * Verify if menu is closed when we press Escape
        cy.get('body').type('{esc}', {force: true});
        cy.uiGetLHSTeamMenu().should('not.exist');
    });

    it('MM-T1477 Accessibility Support in Status Dropdown', () => {
        // # Focus to set status button
        cy.uiGetSetStatusButton().focus().tab({shift: true}).tab();

        // * Verify the aria-label in status menu button
        cy.uiGetSetStatusButton().
            should('have.class', 'a11y--active a11y--focused').
            click();

        // * Verify the accessibility support in the Status Dropdown
        cy.uiGetStatusMenuContainer().
            should('have.attr', 'aria-label', 'set status').
            and('have.class', 'a11y__popup').
            and('have.attr', 'role', 'menu');

        // * Verify the first option is not selected by default
        cy.uiGetStatusMenuContainer().find('.dropdown-menu').children().eq(0).should('not.have.class', 'a11y--active a11y--focused');

        // # Press tab
        cy.focused().tab();

        // * Verify the accessibility support in the Status Dropdown menu items
        const menuItems = [
            {id: 'status-menu-custom-status', label: 'Custom Status dialog'},
            {id: 'status-menu-online', label: 'online'},
            {id: 'status-menu-away', label: 'away'},
            {id: 'status-menu-dnd', label: 'do not disturb. disables all notifications'},
            {id: 'status-menu-offline', label: 'offline'},
        ];

        menuItems.forEach((item) => {
            // * Verify that the menu item is focused
            cy.uiGetStatusMenuContainer().find(`#${item.id}`).
                should('be.visible').
                findAllByLabelText(item.label).first().
                should('have.class', 'a11y--active a11y--focused');

            // # Press tab for next item
            cy.focused().tab();
        });

        // * Verify if menu is closed when we press Escape
        cy.get('body').type('{esc}', {force: true});
        cy.uiGetStatusMenuContainer({exist: false});
    });
});
