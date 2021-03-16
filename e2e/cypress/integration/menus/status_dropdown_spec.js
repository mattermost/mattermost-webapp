// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @menu

describe('Status dropdown menu', () => {
    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup().then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
        cy.apiUpdateConfig({TeamSettings: {EnableCustomUserStatuses: false}});
    });

    afterEach(() => {
        // # Reset user status to online to prevent status modal
        cy.apiUpdateUserStatus('online');

        cy.reload();
    });

    it('Displays default menu when status icon is clicked', () => {
        // # Wait for posts to load
        cy.get('#postListContent').should('be.visible');

        // # Click status menu
        cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

        // # Wait for status menu to transition in
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu').should('be.visible');
    });

    it('Changes status icon to online when "Online" menu item is selected', () => {
        // # Wait for posts to load
        cy.get('#postListContent').should('be.visible');

        // # Set user status to away to ensure menu click changes status
        cy.apiUpdateUserStatus('away').then(() => {
            // # Click status menu
            cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

            // # Wait for status menu to transition in
            cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu').should('be.visible');

            cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu #status-menu-online').click();

            cy.get('.MenuWrapper.status-dropdown-menu > .status-wrapper > button.status > span > svg > path.online--icon').should('exist');
        });
    });

    it('Changes status icon to away when "Away" menu item is selected', () => {
        // # Wait for posts to load
        cy.get('#postListContent').should('be.visible');

        // # Click status menu
        cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

        // # Wait for status menu to transition in
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu').should('be.visible');

        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu #status-menu-away').click();

        cy.get('.MenuWrapper.status-dropdown-menu > .status-wrapper > button.status > span > svg > path.away--icon').should('exist');
    });

    it('Changes status icon to do not disturb when "Do Not Disturb" menu item is selected', () => {
        // # Wait for posts to load
        cy.get('#postListContent').should('be.visible');

        // # Click status menu
        cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

        // # Wait for status menu to transition in
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu').should('be.visible');

        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu #status-menu-dnd').click();

        cy.get('.MenuWrapper.status-dropdown-menu > .status-wrapper > button.status > span > svg > path.dnd--icon').should('exist');
    });

    it('Changes status icon to offline when "Offline" menu item is selected', () => {
        // # Wait for posts to load
        cy.get('#postListContent').should('be.visible');

        // # Click status menu
        cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

        // # Wait for status menu to transition in
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu').should('be.visible');

        // # Click "Offline" in menu
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu #status-menu-offline').click();

        // * Check that icon is offline icon
        cy.get('.MenuWrapper.status-dropdown-menu > .status-wrapper > button.status > span > svg.offline--icon').should('exist');
    });

    describe('MM-T2927 Set user status', () => {
        const statusTestCases = [
            {id: 'status-menu-online', icon: 'online--icon', text: 'Online'},
            {id: 'status-menu-away', icon: 'away--icon', text: 'Away'},
            {id: 'status-menu-dnd', icon: 'dnd--icon', text: 'Do Not Disturb', helpText: 'Disables all notifications'},
            {id: 'status-menu-offline', text: 'Offline'},
        ];

        it('MM-T2927_1 should open status menu', () => {
            // # Wait for posts to load
            cy.get('#postListContent').should('be.visible');

            // # Open status menu
            cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

            // # Wait for status menu to transition in
            cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu').should('be.visible');
        });

        it('MM-T2927_2 should show all available statuses with their icons', () => {
            // # Wait for posts to load
            cy.get('#postListContent').should('be.visible');

            // # Open status menu
            cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

            // # Wait for status menu to transition in
            cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu').should('be.visible');

            statusTestCases.forEach((tc) => {
                // * Verify status text
                cy.get(`.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu li#${tc.id} span.MenuItem__primary-text`).should('have.text', tc.text);

                // * Verify status help text
                if (tc.helpText) {
                    cy.get(`.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu li#${tc.id} span.MenuItem__help-text`).should('have.text', tc.helpText);
                }

                // * Verify status icon
                if (tc.icon) {
                    cy.get(`.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu li#${tc.id} span.icon span.${tc.icon}`).should('be.visible');
                } else {
                    cy.get(`.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu li#${tc.id} span.icon span:not([class])`).should('be.visible');
                }
            });
        });

        it('MM-T2927_3 should select each status, and have the user\'s active status change', () => {
            // # Wait for posts to load
            cy.get('#postListContent').should('be.visible');

            // * Verify all statuses will change the user's status icon
            statusTestCases.forEach((tc) => {
                // # Open status menu
                cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

                // # Wait for status menu to transition in
                cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu').should('be.visible');

                // # Click status choice
                cy.get(`.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu li#${tc.id}`).should('be.visible').
                    and('have.css', 'cursor', 'pointer').click();

                // # Verify correct status icon is shown on user's profile picture
                cy.get('.MenuWrapper.status-dropdown-menu svg').should('have.attr', 'aria-label', `${tc.text} Icon`);
            });
        });

        it('MM-T2927_5 Verify "Set a Custom Header Status" is clickable', () => {
            // # Wait for posts to load
            cy.get('#postListContent').should('be.visible');

            // # Open status menu
            cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

            // * Verify "Set a Custom Status" header is clickable
            cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu li:nth-child(3)').should('be.visible').
                and('have.text', 'Set a Custom Status').and('have.css', 'cursor', 'pointer');
        });
    });
});
