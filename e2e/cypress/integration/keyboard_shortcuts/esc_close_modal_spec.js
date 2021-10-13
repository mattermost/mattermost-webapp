// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @keyboard_shortcuts

describe('Keyboard Shortcuts', () => {
    let testUser;

    before(() => {
        cy.apiInitSetup().then(({user, offTopicUrl}) => {
            testUser = user;
            cy.apiLogin(testUser);
            cy.visit(offTopicUrl);
        });
    });

    it('MM-T1244 CTRL/CMD+K - Esc closes modal', () => {
        const searchTerm = 'test';

        // # Open Channel switcher modal by click on the button
        cy.findByRole('button', {name: 'Channel Switcher'}).click();

        // # Type in the quick switch input box
        cy.get('#quickSwitchInput').type(searchTerm);

        // * Verify that the no search result test is displayed
        cy.get('.no-results__title').should('be.visible').and('have.text', 'No results for "' + searchTerm + '"');

        // # Press escape key
        cy.get('#quickSwitchInput').type('{esc}');

        // * Verify that the modal is closed
        cy.get('.modal-content').should('not.exist');
    });
});
