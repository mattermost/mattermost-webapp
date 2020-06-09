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
    beforeEach(() => {
        // # Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');

        // # Reset user status to online to prevent status modal
        cy.apiUpdateUserStatus();
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
        cy.apiUpdateUserStatus('away');

        // # Click status menu
        cy.get('.MenuWrapper .status-wrapper.status-selector button.status').click();

        // # Wait for status menu to transition in
        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu').should('be.visible');

        cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu #status-menu-online').click();

        cy.get('.MenuWrapper.status-dropdown-menu > .status-wrapper > button.status > span > svg > path.online--icon').should('exist');
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
});