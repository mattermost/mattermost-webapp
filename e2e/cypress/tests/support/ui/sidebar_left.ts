// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {ChainableT} from '../api/types';

function uiGetLHS(): ChainableT<JQuery> {
    return cy.get('#SidebarContainer').should('be.visible');
}
Cypress.Commands.add('uiGetLHS', uiGetLHS);

function uiGetLHSHeader(): ChainableT<JQuery> {
    return cy.uiGetLHS().
        find('.SidebarHeaderMenuWrapper').
        should('be.visible');
}
Cypress.Commands.add('uiGetLHSHeader', uiGetLHSHeader);

function uiOpenTeamMenu(item = ''): ChainableT<JQuery> {
    // # Click on LHS header
    cy.uiGetLHSHeader().click();

    if (!item) {
        // # Return the menu if no item is passed
        return cy.uiGetLHSTeamMenu();
    }

    // # Click on a particular item
    return cy.uiGetLHSTeamMenu().
        findByText(item).
        scrollIntoView().
        should('be.visible').
        click();
}
Cypress.Commands.add('uiOpenTeamMenu', uiOpenTeamMenu);

function uiGetLHSAddChannelButton(): ChainableT<JQuery> {
    return cy.uiGetLHS().
        findByRole('button', {name: 'Add Channel Dropdown'});
}
Cypress.Commands.add('uiGetLHSAddChannelButton', uiGetLHSAddChannelButton);

function uiGetLHSTeamMenu(): ChainableT<JQuery> {
    return cy.uiGetLHS().find('#sidebarDropdownMenu');
}
Cypress.Commands.add('uiGetLHSTeamMenu', uiGetLHSTeamMenu);

function uiOpenSystemConsoleMenu(item = ''): ChainableT<JQuery> {
    // # Click on LHS header button
    cy.uiGetSystemConsoleButton().click();

    if (!item) {
        // # Return the menu if no item is passed
        return cy.uiGetSystemConsoleMenu();
    }

    // # Click on a particular item
    return cy.uiGetSystemConsoleMenu().
        findByText(item).
        scrollIntoView().
        should('be.visible').
        click();
}
Cypress.Commands.add('uiOpenSystemConsoleMenu', uiOpenSystemConsoleMenu);

function uiGetSystemConsoleButton(): ChainableT<JQuery> {
    return cy.get('.admin-sidebar').
        findByRole('button', {name: 'Menu Icon'});
}
Cypress.Commands.add('uiGetSystemConsoleButton', uiGetSystemConsoleButton);

function uiGetSystemConsoleMenu(): ChainableT<JQuery> {
    return cy.get('.admin-sidebar').
        find('.dropdown-menu').
        should('be.visible');
}
Cypress.Commands.add('uiGetSystemConsoleMenu', uiGetSystemConsoleMenu);

function uiGetLhsSection(section: string): ChainableT<JQuery> {
    if (section === 'UNREADS') {
        return cy.findByText(section).
            parent().
            parent().
            parent();
    }

    return cy.findAllByRole('button', {name: section}).
        first().
        parent().
        parent().
        parent();
}
Cypress.Commands.add('uiGetLhsSection', uiGetLhsSection);

function uiBrowseOrCreateChannel(item: string): ChainableT<JQuery | undefined> {
    cy.findByRole('button', {name: 'Add Channel Dropdown'}).
        should('be.visible').
        click();
    cy.get('.dropdown-menu').should('be.visible');

    if (item) {
        return cy.findByRole('menuitem', {name: item});
    }
    return undefined;
}
Cypress.Commands.add('uiBrowseOrCreateChannel', uiBrowseOrCreateChannel);

function uiAddDirectMessage(): ChainableT<JQuery> {
    return cy.findByRole('button', {name: 'Write a direct message'});
}
Cypress.Commands.add('uiAddDirectMessage', uiAddDirectMessage);

function uiGetFindChannels(): ChainableT<JQuery> {
    return cy.get('#lhsNavigator').findByRole('button', {name: 'Find Channels'});
}
Cypress.Commands.add('uiGetFindChannels', uiGetFindChannels);

function uiOpenFindChannels() {
    cy.uiGetFindChannels().click();
}
Cypress.Commands.add('uiOpenFindChannels', uiOpenFindChannels);

function uiGetSidebarThreadsButton(): ChainableT<JQuery> {
    return cy.get('#sidebar-threads-button').should('be.visible');
}
Cypress.Commands.add('uiGetSidebarThreadsButton', uiGetSidebarThreadsButton);

function uiGetChannelSidebarMenu(channelName: string): ChainableT<JQuery> {
    cy.get(`#sidebarItem_${channelName}`).
        find('.SidebarMenu_menuButton').
        click({force: true});

    return cy.get('.dropdown-menu').should('be.visible');
}
Cypress.Commands.add('uiGetChannelSidebarMenu', uiGetChannelSidebarMenu);

function uiGetSidebarInsightsButton(): ChainableT<JQuery> {
    cy.get('#sidebar-insights-button').should('be.visible');
});
Cypress.Commands.add('uiGetSidebarInsightsButton', uiGetSidebarInsightsButton);

function uiClickSidebarItem(name: string) {
    cy.uiGetSidebarItem(name).click();

    if (name === 'threads') {
        cy.get('body').then((body) => {
            if (body.find('#genericModalLabel').length > 0) {
                cy.uiCloseModal('A new way to view and follow threads');
            }
        });
        cy.findByRole('heading', {name: 'Followed threads'});
    } else {
        cy.findAllByTestId('postView').should('be.visible');
    }
}
Cypress.Commands.add('uiClickSidebarItem', uiClickSidebarItem);

function uiGetSidebarItem(channelName: string): ChainableT<JQuery> {
    return cy.get(`#sidebarItem_${channelName}`);
}
Cypress.Commands.add('uiGetSidebarItem', uiGetSidebarItem);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Get LHS
             *
             * @example
             *   cy.uiGetLHS();
             */
            uiGetLHS: typeof uiGetLHS;

            /**
             * Get LHS header
             *
             * @example
             *   cy.uiGetLHSHeader().click();
             */
            uiGetLHSHeader: typeof uiGetLHSHeader;

            /**
             * Open team menu
             *
             * @param {string} item - ex. 'Invite People', 'Team Settings', etc.
             *
             * @example
             *   cy.uiOpenTeamMenu();
             */
            uiOpenTeamMenu: typeof uiOpenTeamMenu;

            /**
             * Get LHS add channel button
             *
             * @example
             *   cy.uiGetLHSAddChannelButton().click();
             */
            uiGetLHSAddChannelButton: typeof uiGetLHSAddChannelButton;

            /**
             * Get LHS team menu
             *
             * @example
             *   cy.uiGetLHSTeamMenu().should('not.exist);
             */
            uiGetLHSTeamMenu: typeof uiGetLHSTeamMenu;

            /**
             * Get LHS section
             * @param {string} section - section such as UNREADS, CHANNELS, FAVORITES, DIRECT MESSAGES and other custom category
             *
             * @example
             *   cy.uiGetLhsSection('CHANNELS');
             */
            uiGetLhsSection: typeof uiGetLhsSection;

            /**
             * Open menu to browse or create channel
             * @param {string} item - dropdown menu. If set, it will do click action.
             *
             * @example
             *   cy.uiBrowseOrCreateChannel('Browse Channels');
             */
            uiBrowseOrCreateChannel: typeof uiBrowseOrCreateChannel;

            /**
             * Get "+" button to write a direct message
             * @example
             *   cy.uiAddDirectMessage();
             */
            uiAddDirectMessage: typeof uiAddDirectMessage;

            /**
             * Get find channels button
             * @example
             *   cy.uiGetFindChannels();
             */
            uiGetFindChannels: typeof uiGetFindChannels;

            /**
             * Open find channels
             * @example
             *   cy.uiOpenFindChannels();
             */
            uiOpenFindChannels(): ChainableT<void>;

            /**
             * Open menu of a channel in the sidebar
             * @param {string} channelName - name of channel, ex. 'town-square'
             *
             * @example
             *   cy.uiGetChannelSidebarMenu('town-square');
             */
            uiGetChannelSidebarMenu: typeof uiGetChannelSidebarMenu;

            /**
             * Click sidebar item by channel or thread name
             * @param {string} name - channel name for channels, and threads for Global Threads
             *
             * @example
             *   cy.uiClickSidebarItem('town-square');
             */
            uiClickSidebarItem(name: string): ChainableT<void>;

            /**
             * Get sidebar item by channel or thread name
             * @param {string} name - channel name for channels, and threads for Global Threads
             *
             * @example
             *   cy.uiGetSidebarItem('town-square').find('.badge').should('be.visible');
             */
            uiGetSidebarItem: typeof uiGetSidebarItem;

            uiOpenSystemConsoleMenu: typeof uiOpenSystemConsoleMenu;

            uiGetSystemConsoleButton: typeof uiGetSystemConsoleButton;

            uiGetSystemConsoleMenu: typeof uiGetSystemConsoleMenu;

            uiGetSidebarThreadsButton: typeof uiGetSidebarThreadsButton;
        }
    }
}
