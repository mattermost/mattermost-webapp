
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint-disable max-nested-callbacks */
describe('Channel Settings', () => {
    before(() => {
        // 1. Go to Main Channel View with "user-1"
        cy.toMainChannelView('user-1');
    });

    it('C15052 All channel types have appropriate close button', () => {
        cy.get('#publicChannelList').find('a.sidebar-item').each(($el) => {
            cy.wrap($el).find('span.btn-close').should('not.exist');
        });

        cy.get('#privateChannelList').find('a.sidebar-item').each(($el) => {
            cy.wrap($el).find('span.btn-close').should('not.exist');
        });

        // add a direct message incase there is not one
        cy.get('#directChannel button').click();
        cy.get('.more-modal__row.clickable').first().click();
        cy.get('#saveItems').click();

        // click on all the messages to make sure there are none left unread
        cy.get('#directChannelList').children('li:not(:first-child)').each(($el) => {
            cy.wrap($el).click();
        });

        // check for the close button
        cy.get('#directChannelList').find('a.sidebar-item').each(($el) => {
            cy.wrap($el).find('span.btn-close').should('exist');
        });
    });
});