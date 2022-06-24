// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {ChainableT} from '../api/types';

function uiGetProductMenuButton(): ChainableT<JQuery> {
    return cy.findByRole('button', {name: 'Select to open product switch menu.'}).should('be.visible');
}
Cypress.Commands.add('uiGetProductMenuButton', uiGetProductMenuButton);

function uiGetProductMenu(): ChainableT<JQuery> {
    return cy.get('.product-switcher-menu').should('be.visible');
}
Cypress.Commands.add('uiGetProductMenu', uiGetProductMenu);

function uiOpenProductMenu(item = ''): ChainableT<JQuery> {
    // # Click on product switch button
    cy.uiGetProductMenuButton().click();

    if (!item) {
        // # Return the menu if no item is passed
        return cy.uiGetProductMenu();
    }

    // # Click on a particular item
    return cy.uiGetProductMenu().
        findByText(item).
        scrollIntoView().
        should('be.visible').
        click();
}
Cypress.Commands.add('uiOpenProductMenu', uiOpenProductMenu);

function uiGetSetStatusButton(): ChainableT<JQuery> {
    return cy.findByRole('button', {name: 'set status'}).should('be.visible');
}
Cypress.Commands.add('uiGetSetStatusButton', uiGetSetStatusButton);

function uiGetProfileHeader(): ChainableT<JQuery> {
    return cy.uiGetSetStatusButton().parent();
}
Cypress.Commands.add('uiGetProfileHeader', uiGetProfileHeader);

function uiGetStatusMenuContainer(options = {exist: true}): ChainableT<JQuery> {
    if (options.exist) {
        return cy.findByRole('menu').should('exist');
    }

    return cy.findByRole('menu').should('not.exist');
}
Cypress.Commands.add('uiGetStatusMenuContainer', uiGetStatusMenuContainer);

function uiGetStatusMenu(options = {visible: true}): ChainableT<JQuery> {
    if (options.visible) {
        return cy.uiGetStatusMenuContainer().
            find('ul').
            should('be.visible');
    }

    return cy.uiGetStatusMenuContainer().
        find('ul').
        should('not.be.visible');
}
Cypress.Commands.add('uiGetStatusMenu', uiGetStatusMenu);

function uiOpenHelpMenu(item = ''): ChainableT<JQuery> {
    // # Click on help status button
    cy.uiGetHelpButton().click();

    if (!item) {
        // # Return the menu if no item is passed
        return cy.uiGetHelpMenu();
    }

    // # Click on a particular item
    return cy.uiGetHelpMenu().
        findByText(item).
        scrollIntoView().
        should('be.visible').
        click();
}
Cypress.Commands.add('uiOpenHelpMenu', uiOpenHelpMenu);

function uiGetHelpButton(): ChainableT<JQuery> {
    return cy.findByRole('button', {name: 'Select to toggle the help menu.'}).should('be.visible');
}
Cypress.Commands.add('uiGetHelpButton', uiGetHelpButton);

function uiGetHelpMenu(options = {visible: true}): ChainableT<JQuery> {
    const dropdown = () => cy.get('#helpMenuPortal').find('.dropdown-menu');

    if (options.visible) {
        return dropdown().should('be.visible');
    }

    return dropdown().should('not.be.visible');
}
Cypress.Commands.add('uiGetHelpMenu', uiGetHelpMenu);

function uiOpenUserMenu(item = ''): ChainableT<any> {
    // # Click on user status button
    cy.uiGetSetStatusButton().click();

    if (!item) {
        // # Return the menu if no item is passed
        return cy.uiGetStatusMenu();
    }

    // # Click on a particular item
    return cy.uiGetStatusMenu().
        findByText(item).
        scrollIntoView().
        should('be.visible').
        click();
}
Cypress.Commands.add('uiOpenUserMenu', uiOpenUserMenu);

function uiGetSearchContainer(): ChainableT<JQuery> {
    return cy.get('#searchFormContainer').should('be.visible');
}
Cypress.Commands.add('uiGetSearchContainer', uiGetSearchContainer);

function uiGetSearchBox(): ChainableT<JQuery> {
    return cy.get('#searchBox').should('be.visible');
}
Cypress.Commands.add('uiGetSearchBox', uiGetSearchBox);

function uiGetRecentMentionButton(): ChainableT<JQuery> {
    return cy.findByRole('button', {name: 'Select to toggle a list of recent mentions.'}).should('be.visible');
}
Cypress.Commands.add('uiGetRecentMentionButton', uiGetRecentMentionButton);

function uiGetSavedPostButton(): ChainableT<JQuery> {
    return cy.findByRole('button', {name: 'Select to toggle a list of saved posts.'}).should('be.visible');
}
Cypress.Commands.add('uiGetSavedPostButton', uiGetSavedPostButton);

function uiGetSettingsButton(): ChainableT<JQuery> {
    return cy.findByRole('button', {name: 'Select to open the settings modal.'}).should('be.visible');
}
Cypress.Commands.add('uiGetSettingsButton', uiGetSettingsButton);

function uiGetSettingsModal(): ChainableT<JQuery> {
    // # Get settings modal
    return cy.findByRole('dialog', {name: 'Settings'});
}
Cypress.Commands.add('uiGetSettingsModal', uiGetSettingsModal);

function uiOpenSettingsModal(section = ''): ChainableT<JQuery> {
    // # Open settings modal
    cy.uiGetSettingsButton().click();

    if (!section) {
        return cy.uiGetSettingsModal();
    }

    // # Click on a particular section
    cy.findByRoleExtended('button', {name: section}).should('be.visible').click();

    return cy.uiGetSettingsModal();
}
Cypress.Commands.add('uiOpenSettingsModal', uiOpenSettingsModal);

function uiLogout() {
    // # Click logout via user menu
    cy.uiOpenUserMenu('Log Out');

    cy.url().should('include', '/login');
    cy.get('.login-body-message').should('be.visible');
    cy.get('.login-body-card').should('be.visible');
}
Cypress.Commands.add('uiLogout', uiLogout);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Get product switch button
             *
             * @example
             *   cy.uiGetProductMenuButton().click();
             */
            uiGetProductMenuButton: typeof uiGetProductMenuButton;

            /**
             * Get product switch menu
             *
             * @example
             *   cy.uiGetProductMenu().click();
             */
            uiGetProductMenu: typeof uiGetProductMenu;

            /**
             * Open product switch menu
             *
             * @param {string} item - menu item ex. System Console, Integrations, etc.
             *
             * @example
             *   cy.uiOpenProductMenu().click();
             */
            uiOpenProductMenu: typeof uiOpenProductMenu;

            /**
             * Get set status button
             *
             * @example
             *   cy.uiGetSetStatusButton().click();
             */
            uiGetSetStatusButton: typeof uiGetSetStatusButton;

            /**
             * Get status menu container
             *
             * @param {bool} option.exist - Set to false to not verify if the element exists. Otherwise, true (default) to check existence.
             * @example
             *   cy.uiGetStatusMenuContainer({exist: false});
             */
            uiGetStatusMenuContainer: typeof uiGetStatusMenuContainer;

            /**
             * Get user menu
             *
             * @example
             *   cy.uiGetStatusMenu();
             */
            uiGetStatusMenu: typeof uiGetStatusMenu;

            /**
             * Open help menu
             *
             * @param {string} item - menu item ex. Ask the community, Help resources, etc.
             *
             * @example
             *   cy.uiOpenHelpMenu();
             */
            uiOpenHelpMenu: typeof uiOpenHelpMenu;

            /**
             * Get help button
             *
             * @example
             *   cy.uiGetHelpButton();
             */
            uiGetHelpButton(): Chainable;

            /**
             * Get help menu
             *
             * @example
             *   cy.uiGetHelpMenu();
             */
            uiGetHelpMenu: typeof uiGetHelpMenu;

            /**
             * Open user menu
             *
             * @param {string} item - menu item ex. Profile, Logout, etc.
             *
             * @example
             *   cy.uiOpenUserMenu('Profile');
             */
            uiOpenUserMenu: typeof uiOpenUserMenu;

            /**
             * Get search form container
             *
             * @example
             *   cy.uiGetSearchContainer();
             */
            uiGetSearchContainer: typeof uiGetSearchContainer;

            /**
             * Get search box
             *
             * @example
             *   cy.uiGetSearchBox();
             */
            uiGetSearchBox: typeof uiGetSearchBox;

            /**
             * Get at-mention button
             *
             * @example
             *   cy.uiGetRecentMentionButton();
             */
            uiGetRecentMentionButton: typeof uiGetRecentMentionButton;

            /**
             * Get saved posts button
             *
             * @example
             *   cy.uiGetSavedPostButton();
             */
            uiGetSavedPostButton: typeof uiGetSavedPostButton;

            /**
             * Get settings button
             *
             * @example
             *   cy.uiGetSettingsButton();
             */
            uiGetSettingsButton: typeof uiGetSettingsButton;

            /**
             * Get settings modal
             *
             * @example
             *   cy.uiGetSettingsModal();
             */
            uiGetSettingsModal: typeof uiGetSettingsModal;

            /**
             * Open settings modal
             *
             * @param {string} section - ex. Display, Sidebar, etc.
             *
             * @example
             *   cy.uiOpenSettingsModal();
             */
            uiOpenSettingsModal: typeof uiOpenSettingsModal;

            /**
             * User log out via user menu
             *
             * @example
             *   cy.uiLogout();
             */
            uiLogout(): ChainableT<void>;

            /**
             * Get profile header
             *
             * @example
             *   cy.uiGetProfileHeader();
             */
            uiGetProfileHeader: typeof uiGetProfileHeader;
        }
    }
}
