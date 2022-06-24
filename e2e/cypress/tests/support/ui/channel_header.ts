// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from '../api/types';

// Buttons

function uiGetChannelHeaderButton(): ChainableT<JQuery> {
    return cy.get('#channelHeaderDropdownButton').should('be.visible');
}
Cypress.Commands.add('uiGetChannelHeaderButton', uiGetChannelHeaderButton);

function uiGetChannelFavoriteButton(): ChainableT<JQuery> {
    return cy.get('#toggleFavorite').should('be.visible');
}
Cypress.Commands.add('uiGetChannelFavoriteButton', uiGetChannelFavoriteButton);

function uiGetMuteButton(): ChainableT<JQuery> {
    return cy.get('#toggleMute').should('be.visible');
}
Cypress.Commands.add('uiGetMuteButton', uiGetMuteButton);

function uiGetChannelMemberButton(): ChainableT<JQuery> {
    return cy.get('#member_rhs').should('be.visible');
}
Cypress.Commands.add('uiGetChannelMemberButton', uiGetChannelMemberButton);

function uiGetChannelPinButton(): ChainableT<JQuery> {
    return cy.get('#channelHeaderPinButton').should('be.visible');
}
Cypress.Commands.add('uiGetChannelPinButton', uiGetChannelPinButton);

function uiGetChannelFileButton(): ChainableT<JQuery> {
    return cy.get('#channelHeaderFilesButton').should('be.visible');
}
Cypress.Commands.add('uiGetChannelFileButton', uiGetChannelFileButton);

// Menus

function uiGetChannelMenu(options = {exist: true}): ChainableT<JQuery> {
    if (options.exist) {
        return cy.get('#channelHeaderDropdownMenu').
            find('.dropdown-menu').
            should('be.visible');
    }

    return cy.get('#channelHeaderDropdownMenu').should('not.exist');
}
Cypress.Commands.add('uiGetChannelMenu', uiGetChannelMenu);

function uiOpenChannelMenu(item = ''): ChainableT<JQuery> {
    // # Click on channel header button
    cy.uiGetChannelHeaderButton().click();

    if (!item) {
        // # Return the menu if no item is passed
        return cy.uiGetChannelMenu();
    }

    // # Click on a particular item
    return cy.uiGetChannelMenu().
        findByText(item).
        scrollIntoView().
        should('be.visible').
        click();
}
Cypress.Commands.add('uiOpenChannelMenu', uiOpenChannelMenu);

declare global {
    namespace Cypress {
        interface Chainable {

            /**
             * Get channel header button.
             *
             * @example
             *   cy.uiGetChannelHeaderButton().click();
             */
            uiGetChannelHeaderButton: typeof uiGetChannelHeaderButton;

            /**
             * Get favorite button from channel header.
             *
             * @example
             *   cy.uiGetChannelFavoriteButton().click();
             */
            uiGetChannelFavoriteButton: typeof uiGetChannelFavoriteButton;

            /**
             * Get mute button from channel header.
             *
             * @example
             *   cy.uiGetMuteButton().click();
             */
            uiGetMuteButton: typeof uiGetMuteButton;

            /**
             * Get member button from channel header.
             *
             * @example
             *   cy.uiGetChannelMemberButton().click();
             */
            uiGetChannelMemberButton: typeof uiGetChannelMemberButton;

            /**
             * Get pin button from channel header.
             *
             * @example
             *   cy.uiGetChannelPinButton().click();
             */
            uiGetChannelPinButton: typeof uiGetChannelPinButton;

            /**
             * Get files button from channel header.
             *
             * @example
             *   cy.uiGetChannelFileButton().click();
             */
            uiGetChannelFileButton: typeof uiGetChannelFileButton;

            /**
             * Get channel menu
             *
             * @example
             *   cy.uiGetChannelMenu();
             */
            uiGetChannelMenu: typeof uiGetChannelMenu;

            /**
             * Open channel menu
             * @param {string} item - such as `'View Info'`, `'Notification Preferences'`, `'Team Settings'` and other items in the main menu.
             * @return the channel menu
             *
             * @example
             *   cy.uiOpenChannelMenu();
             */
            uiOpenChannelMenu(): Chainable;
        }
    }
}
