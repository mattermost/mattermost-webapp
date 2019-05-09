
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
        cy.get('#publicChannel').parent().parent().children('li:not(:first-child)').not('#morePublicButton').each(($el) => {
            cy.wrap($el).find('a').find('span.btn-close').should('have.length', 0);
        });

        cy.get('#privateChannel').parent().parent().children('li:not(:first-child)').each(($el) => {
            cy.wrap($el).find('a').find('span.btn-close').should('have.length', 0);
        });

        // add a direct message incase there is not one
        cy.get('#directChannel button').click();
        cy.get('.more-modal__row.clickable').first().click();
        cy.get('#saveItems').click();

        // click on all the messages to make sure there are none left unread
        cy.get('#directChannel').parent().parent().children('li:not(:first-child)').not('#moreDMButton').each(($el) => {
            cy.wrap($el).click();
        });

        // check for the close button
        cy.get('#directChannel').parent().parent().children('li:not(:first-child)').not('#moreDMButton').each(($el) => {
            cy.wrap($el).find('a').find('span.btn-close').should('have.length', 1);
        });
    });

    after(() => {
        // cleanup one direct message that was created above
        cy.get('#directChannel').parent().parent().children('li:not(:first-child)').not('#moreDMButton').
            first().find('span.btn-close').click({force: true});
    });
});