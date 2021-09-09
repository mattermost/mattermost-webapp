// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @menu @custom_status @status_menu

import theme from '../../fixtures/theme.json';

describe('Status dropdown menu', () => {
    const statusTestCases = [
        {id: 'status-menu-online', icon: 'online--icon', text: 'Online'},
        {id: 'status-menu-away', icon: 'away--icon', text: 'Away'},
        {id: 'status-menu-dnd_menuitem', icon: 'dnd--icon', text: 'Do Not Disturb'},
        {id: 'status-menu-offline', text: 'Offline'},
    ];

    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
            cy.postMessage('hello');
        });
    });

    beforeEach(() => {
        // # Click anywhere to close open menu
        cy.get('body').click();
    });

    it('MM-T2927_1 Should show all available statuses with their icons', () => {
        // # Open status menu
        cy.uiOpenSetStatusMenu();

        // # Wait for status menu to transition in
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu').should('be.visible');

        statusTestCases.forEach((tc) => {
            // * Verify status text
            cy.get(`.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu li#${tc.id}`).should(tc.text === 'Do Not Disturb' ? 'contain' : 'have.text', tc.text).should('be.visible');

            // * Verify status icon
            if (tc.icon) {
                cy.get(`.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu li#${tc.id} span.icon span.${tc.icon}`).should('be.visible');
            } else {
                cy.get(`.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu li#${tc.id} span.icon span:not([class])`).should('be.visible');
            }
        });
    });

    it('MM-T2927_2 Should select each status, and have the user\'s active status change', () => {
        // * Verify that all statuses get set correctly
        stepThroughStatuses(statusTestCases);
    });

    it('MM-T2927_3 Icons are visible in dark mode', () => {
        // #Change to dark mode
        cy.apiSaveThemePreference(JSON.stringify(theme.dark));

        // * Verify that all statuses get set correctly
        stepThroughStatuses(statusTestCases);

        // # Reset the theme to default
        cy.apiSaveThemePreference(JSON.stringify(theme.default));
    });

    it('MM-T2927_4 "Set a Custom Header Status" is clickable', () => {
        // # Open status menu
        cy.uiOpenSetStatusMenu();

        // * Verify "Set a Custom Status" header is clickable
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu li:nth-child(3)').should('be.visible').
            and('have.text', 'Set a Custom Status').and('have.css', 'cursor', 'pointer');
    });

    it('MM-T2927_5 When custom status is disabled, status menu is displayed when status icon is clicked', () => {
        cy.apiAdminLogin();
        cy.visit('/');

        // # Disable custom statuses
        cy.apiUpdateConfig({TeamSettings: {EnableCustomUserStatuses: false}});

        // # Open status menu
        cy.uiOpenSetStatusMenu();

        // * Verify that the status menu dropdown opens and is visible
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu').should('be.visible');
    });
});

function stepThroughStatuses(statusTestCases = []) {
    // # Wait for posts to load
    cy.get('#postListContent').should('be.visible');

    // * Verify the user's status icon changes correctly every time
    statusTestCases.forEach((tc) => {
        // # Open status menu and click option
        if (tc.text === 'Do Not Disturb') {
            cy.uiOpenDndStatusSubMenu().find('#dndTime-30mins_menuitem').click();
        } else {
            cy.uiOpenSetStatusMenu(tc.text);
        }

        // # Verify correct status icon is shown on user's profile picture
        cy.get('.MenuWrapper.status-dropdown-menu svg').should('have.attr', 'aria-label', `${tc.text} Icon`);
    });
}
