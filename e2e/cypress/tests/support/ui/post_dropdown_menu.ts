// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from '../api/types';

import {stubClipboard} from '../../utils';

function uiClickCopyLink(permalink: string): ChainableT<void> {
    stubClipboard().as('clipboard');

    // * Verify initial state
    cy.get('@clipboard').its('contents').should('eq', '');

    // # Click on "Copy Link"
    cy.get('.dropdown-menu').should('be.visible').within(() => {
        cy.findByText('Copy Link').scrollIntoView().should('be.visible').click();

        // * Verify if it's called with correct link value
        cy.get('@clipboard').its('wasCalled').should('eq', true);
        cy.get('@clipboard').its('contents').should('eq', permalink);
    });
    return;
}
Cypress.Commands.add('uiClickCopyLink', uiClickCopyLink);

function uiClickPostDropdownMenu(postId: string, menuItem: string, location = 'CENTER'): ChainableT<void> {
    cy.clickPostDotMenu(postId, location);
    cy.findAllByTestId(`post-menu-${postId}`).eq(0).should('be.visible');
    cy.findByText(menuItem).scrollIntoView().should('be.visible').click({force: true});
    return;
}
Cypress.Commands.add('uiClickPostDropdownMenu', uiClickPostDropdownMenu);

function uiPostDropdownMenuShortcut(postId: string, menuText: string, shortcutKey: string, location = 'CENTER'): ChainableT<void> {
    cy.clickPostDotMenu(postId, location);
    cy.findByText(menuText).scrollIntoView().should('be.visible');
    cy.get('body').type(shortcutKey);
    return;
}
Cypress.Commands.add('uiPostDropdownMenuShortcut', uiPostDropdownMenuShortcut);

declare global {
    namespace Cypress {
        interface Chainable {

            /**
             * Click on "Copy Link" of post dropdown menu and verifies if the link is copied into the clipboard
             * Created user has an option to log in after all are setup.
             * @param {string} permalink - permalink to verify if copied into the clipboard
             *
             * @example
             *   const permalink = 'http://localhost:8065/team-name/pl/post-id';
             *   cy.uiClickCopyLink(permalink);
             */
            uiClickCopyLink: typeof uiClickCopyLink;

            /**
             * Click dropdown menu of a post by post ID.
             * @param {String} postId - post ID
             * @param {String} menuItem - e.g. "Pin to channel"
             * @param {String} location - 'CENTER' (default), 'SEARCH', RHS_ROOT, RHS_COMMENT
             */
            uiClickPostDropdownMenu: typeof uiClickPostDropdownMenu;
        }
    }
}
