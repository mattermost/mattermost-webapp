// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('I18456 Built-in slash commands: common', () => {
    before(() => {
        loginAndVisitDefaultChannel('user-1');
    });

    it('/ autocomplete list can scroll', () => {
        // # Clear post textbox
        cy.get('#post_textbox').clear().type('/');

        // * Suggestion list should be visible
        // # Scroll to bottom and verify that the last command "/shrug" is visible
        cy.get('#suggestionList').should('be.visible').scrollTo('bottom').then((container) => {
            cy.findByText(/\/away/, {container}).should('not.be.visible');
            cy.findByText(/\/shrug/, {container}).should('be.visible');
        });

        // # Scroll to top and verify that the first command "/away" is visible
        cy.get('#suggestionList').scrollTo('top').then((container) => {
            cy.findByText(/\/away/, {container}).should('be.visible');
            cy.findByText(/\/shrug/, {container}).should('not.be.visible');
        });
    });

    it('/shrug test', () => {
        // # Login as user-2 and post a message
        loginAndVisitDefaultChannel('user-2');
        cy.postMessage('hello from user-2');

        // # Login as user-1 and post "/shrug test"
        loginAndVisitDefaultChannel('user-1');
        cy.postMessage('/shrug test{enter}');

        // * Verify that it posted message as expected from user-1
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).find('.user-popover').should('have.text', 'user-1');
            cy.get(`#postMessageText_${postId}`).should('have.text', 'test ¯\\_(ツ)_/¯');
        });

        // * Login as user-2 and verify that it read the same message as expected from user-1
        loginAndVisitDefaultChannel('user-2');
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).find('.user-popover').should('have.text', 'user-1');
            cy.get(`#postMessageText_${postId}`).should('have.text', 'test ¯\\_(ツ)_/¯');
        });
    });
});

function loginAndVisitDefaultChannel(user) {
    cy.apiLogin(user);
    cy.visit('/');
}
