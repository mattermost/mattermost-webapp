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

        //# text from invoke method
        cy.get('#moreDirectMessage').click();

        //# text from invoke method
        cy.getAllByTestId('username').eq(1).children('span').invoke('text').then((text) => {
            //# getting username text
            user1 = text.split(' ')[0];

            cy.get('.more-modal__name').contains(text).click();
        });

        cy.getAllByTestId('username').eq(1).children('span').invoke('text').then((text) => {
            //# getting username text and removing @
            user2 = text.split(' ')[0].substring(1);

            //# select user from modal
            cy.get('.more-modal__name').contains(text).click();

            //# save values
            cy.get('#saveItems').click();

            //# searching 'lucho' text and hitting enter
            cy.get('#post_textbox').clear().type('lucho').type('{enter}');

            //# writing "in:" text in search input
            cy.get('#searchBox').type('in:');

            //# Search user1 and user2 in menu
            cy.getAllByTestId('listItem').contains(user1 + ',' + user2 + ',user-1').click();

            //# hits enter
            cy.get('#searchBox').type('{enter}');

            //# Search 'lucho'
            cy.get('#searchBox').clear().type('lucho{enter}');

            //# Expect 'lucho' to be highlighted in the page
            cy.get('.search-highlight').first().contains('lucho').should('text', 'lucho');
        });
    });
});
