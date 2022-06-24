// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from '../api/types';

function uiGetRHS(options = {visible: true}): ChainableT<JQuery> {
    if (options.visible) {
        return cy.get('#sidebar-right').should('be.visible');
    }

    return cy.get('#sidebar-right').should('not.be.visible');
}
Cypress.Commands.add('uiGetRHS', uiGetRHS);

function uiCloseRHS() {
    cy.findByLabelText('Close Sidebar Icon').click();
}
Cypress.Commands.add('uiCloseRHS', uiCloseRHS);

function uiExpandRHS() {
    cy.findByLabelText('Expand').click();
}
Cypress.Commands.add('uiExpandRHS', uiExpandRHS);

function isExpanded(subject: any): ChainableT<JQuery> {
    return cy.get(subject).should('have.class', 'sidebar--right--expanded');
}
Cypress.Commands.add('isExpanded', {prevSubject: true}, isExpanded);

function uiGetReply(): ChainableT<JQuery> {
    return cy.findByRole('button', {name: 'Reply'});
}
Cypress.Commands.add('uiGetReply', uiGetReply);

function uiReply() {
    cy.uiGetReply().click();
}
Cypress.Commands.add('uiReply', uiReply);

// Sidebar search container

function uiGetRHSSearchContainer(options = {visible: true}): ChainableT<JQuery> {
    if (options.visible) {
        return cy.get('#searchContainer').should('be.visible');
    }

    return cy.get('#searchContainer').should('not.exist');
}
Cypress.Commands.add('uiGetRHSSearchContainer', uiGetRHSSearchContainer);

// Sidebar files search

function uiGetFileFilterButton(): ChainableT<JQuery> {
    return cy.get('.FilesFilterMenu').should('be.visible');
}
Cypress.Commands.add('uiGetFileFilterButton', uiGetFileFilterButton);

function uiGetFileFilterMenu(option = {exist: true}): ChainableT<JQuery> {
    if (option.exist) {
        return cy.get('.FilesFilterMenu').
            find('.dropdown-menu').
            should('be.visible');
    }

    return cy.get('.FilesFilterMenu').
        find('.dropdown-menu').
        should('not.exist');
}
Cypress.Commands.add('uiGetFileFilterMenu', uiGetFileFilterMenu);

function uiOpenFileFilterMenu(item = ''): ChainableT<JQuery> {
    // # Click on file filter button
    cy.uiGetFileFilterButton().click();

    if (!item) {
        // # Return the menu if no item is passed
        return cy.uiGetFileFilterMenu();
    }

    // # Click on a particular item
    return cy.uiGetFileFilterMenu().
        findByText(item).
        should('be.visible').
        click();
}
Cypress.Commands.add('uiOpenFileFilterMenu', uiOpenFileFilterMenu);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Get RHS container
             *
             *  @param {bool} option.visible - Set to false to check whether RHS is not visible. Otherwise, true (default) to check visibility.
             *
             * @example
             *   cy.uiGetRHS();
             */
            uiGetRHS: typeof uiGetRHS;

            /**
             * Close RHS
             *
             * @example
             *   cy.uiCloseRHS();
             */
            uiCloseRHS(): ChainableT<void>;

            /**
             * Expand RHS
             *
             * @example
             *   cy.uiExpandRHS();
             */
            uiExpandRHS(): ChainableT<void>;

            /**
             * Verify if RHS is expanded
             *
             * @example
             *   cy.uiGetRHS().isExpanded();
             */
            isExpanded: typeof isExpanded;

            /**
             * Get "Reply" button
             *
             * @example
             *   cy.uiGetReply();
             */
            uiGetReply(): Chainable;

            /**
             * Reply by clicking "Reply" button
             *
             * @example
             *   cy.uiReply();
             */
            uiReply(): ChainableT<void>;

            /**
             * Get RHS container
             *
             *  @param {bool} option.visible - Set to false to check whether Search container at RHS is not visible. Otherwise, true (default) to check visibility.
             *
             * @example
             *   cy.uiGetRHSSearchContainer();
             */
            uiGetRHSSearchContainer: typeof uiGetRHSSearchContainer;

            /**
             * Get file filter button from RHS.
             *
             * @example
             *   cy.uiGetFileFilterButton().click();
             */
            uiGetFileFilterButton(): Chainable;

            /**
             * Get file filter menu from RHS
             *
             * @param {bool} option.exist - Set to false to check whether file filter menu should not exist at RHS. Otherwise, true (default) to check visibility.
             *
             * @example
             *   cy.uiGetFileFilterMenu();
             */
            uiGetFileFilterMenu: typeof uiGetFileFilterMenu;

            /**
             * Open file filter menu from RHS
             * @param {string} item - such as `'Documents'`, `'Spreadsheets'`, `'Presentations'`, `'Code'`, `'Images'`, `'Audio'` and `'Videos'`.
             * @return the file filter menu
             *
             * @example
             *   cy.uiOpenFileFilterMenu();
             */
            uiOpenFileFilterMenu: typeof uiOpenFileFilterMenu;
        }
    }
}
