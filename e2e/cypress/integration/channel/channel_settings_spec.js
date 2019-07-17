
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Channel Settings', () => {
    before(() => {
        // # Go to Main Channel View with "user-1"
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
        cy.get('#addDirectChannel').click();
        cy.get('.more-modal__row.clickable').first().click();
        cy.get('#saveItems').click();

        // click on all the messages to make sure there are none left unread
        cy.get('#directChannelList').find('a.sidebar-item').each(($el) => {
            cy.wrap($el).as('channel');

            // Click to mark as unread
            cy.get('@channel').click({force: true});

            cy.get('#postListContent').should('be.visible');

            // check for the close button
            cy.get('@channel').find('span.btn-close').should('exist');
        });
    });
});
