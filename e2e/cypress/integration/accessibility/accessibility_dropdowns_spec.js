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
    let siteName;
    let testTeam;

    before(() => {
        cy.apiGetConfig().then(({config}) => {
            siteName = config.TeamSettings.SiteName;
        });

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
        // # Press tab from the Set Status button
        cy.get('.status-wrapper button.status').focus().wait(TIMEOUTS.HALF_SEC).tab({shift: true}).tab().tab();

        // * Verify the aria-label in main menu button
        cy.get('#headerInfo button').should('have.attr', 'aria-label', 'main menu').and('have.class', 'a11y--active a11y--focused').click();

        // * Verify the accessibility support in the Main Menu Dropdown
        cy.get('#sidebarDropdownMenu').should('have.attr', 'aria-label', 'main menu').and('have.class', 'a11y__popup').and('have.attr', 'role', 'menu');

        // * Verify the first option is not selected by default
        cy.get('#sidebarDropdownMenu .MenuItem').children().eq(0).should('not.have.class', 'a11y--active a11y--focused');

        // # Press tab
        cy.focused().tab();

        // * Verify the accessibility support in the Main Menu Dropdown items
        const menuItems = [
            {id: 'accountSettings', label: 'Account Settings dialog'},
            {id: 'invitePeople', label: 'Invite People dialog'},
            {id: 'teamSettings', label: 'Team Settings dialog'},
            {id: 'manageMembers', label: 'Manage Members dialog'},
            {id: 'createTeam', text: 'Create a Team'},
            {id: 'joinTeam', text: 'Join Another Team'},
            {id: 'leaveTeam', label: 'Leave Team dialog'},
            {id: 'integrations', text: 'Integrations'},
            {id: 'marketplaceModal', label: 'Marketplace dialog'},
            {id: 'systemConsole', text: 'System Console'},
            {id: 'helpLink', text: 'Help', directLink: true},
            {id: 'gettingStarted', text: 'Getting Started'},
            {id: 'keyboardShortcuts', text: 'Keyboard Shortcuts'},
            {id: 'reportLink', text: 'Report a Problem', directLink: true},
            {id: 'nativeAppLink', text: 'Download Apps', directLink: true},
            {id: 'about', label: `About ${siteName} dialog`},
            {id: 'logout', text: 'Log Out'},
        ];

        menuItems.forEach((item) => {
            if (!item.shouldSkip) {
                // * Verify that the menu item is focused
                cy.get('#sidebarDropdownMenu').find(`#${item.id}`).should('be.visible').within(() => {
                    if (item.label) {
                        cy.findByLabelText(item.label).should('have.class', 'a11y--active a11y--focused');
                    } else if (item.directLink) {
                        cy.findByText(item.text).should('have.class', 'a11y--active a11y--focused');
                    } else {
                        cy.findByText(item.text).parent().should('have.class', 'a11y--active a11y--focused');
                    }
                });

                // # Press tab for next item
                cy.focused().tab();
            }
        });

        cy.get('#sidebarDropdownMenu .MenuItem').each((el) => {
            cy.wrap(el).should('have.attr', 'role', 'menuitem');
        });

        // * Verify if menu is closed when we press Escape
        cy.get('body').type('{esc}', {force: true});
        cy.get('#sidebarDropdownMenu').should('not.exist');
    });

    it('MM-T1477 Accessibility Support in Status Dropdown', () => {
        // # Press tab from the test team button
        cy.get(`#${testTeam.name}TeamButton`).focus().wait(TIMEOUTS.HALF_SEC).tab({shift: true}).tab().tab().tab();

        // * Verify the aria-label in status menu button
        cy.get('.status-wrapper button.status').should('have.attr', 'aria-label', 'set status').and('have.class', 'a11y--active a11y--focused').click();

        // * Verify the accessibility support in the Status Dropdown
        cy.get('#statusDropdownMenu').should('have.attr', 'aria-label', 'set status').and('have.class', 'a11y__popup').and('have.attr', 'role', 'menu');

        // * Verify the first option is not selected by default
        cy.get('#statusDropdownMenu .MenuItem').children().eq(0).should('not.have.class', 'a11y--active a11y--focused');

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
            cy.get('#statusDropdownMenu').find(`#${item.id}`).
                should('be.visible').
                findAllByLabelText(item.label).first().
                should('have.class', 'a11y--active a11y--focused');

            // # Press tab for next item
            cy.focused().tab();
        });

        // * Verify if menu is closed when we press Escape
        cy.get('body').type('{esc}', {force: true});
        cy.get('#statusDropdownMenu').should('not.exist');
    });
});
