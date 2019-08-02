// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************
describe('Messaging', () => {
    before(() => {
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('should returns results in GMs', () => {
        let user1;
        let user2;

        cy.get('#moreDirectMessage').click();

        cy.getAllByTestId('username').eq(1).children('span').invoke('text').then((text) => {
            user1 = text;
            user1 = user1.split(' ');
            user1 = user1[0];
            cy.get('.more-modal__name').contains(text).click();
        });

        cy.getAllByTestId('username').eq(1).children('span').invoke('text').then((text) => {
            user2 = text;
            user2 = user2.split(' ');
            user2 = user2[0].replace(/([^a])/, '');

            cy.get('.more-modal__name').contains(text).click();

            cy.get('#saveItems').click();

            cy.get('#post_textbox').clear().type('lucho').type('{enter}');

            cy.get('#searchBox').type('in:');

            cy.getAllByTestId('listItem').contains(user1 + ',' + user2 + ',user-1').click();

            cy.get('#searchBox').type('{enter}');

            cy.get('#searchBox').clear().type('lucho{enter}');

            cy.get('.search-highlight').first().contains('lucho').should('text', 'lucho');
        });
    });
});
