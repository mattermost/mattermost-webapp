// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

function verifySuggestionList({input, expected, withoutSuggestion}) {
    cy.get('#post_textbox').clear().type(input);

    if (withoutSuggestion) {
        cy.get('#suggestionList').should('not.exist');
    } else {
        const re = new RegExp(expected, 'g');
        cy.get('#suggestionList').should('be.visible').within(() => {
            cy.findByText(re).should('be.visible');
        });
    }
}

describe('Mention user', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('M19761 autocomplete should match on cases', () => {
        [
            {input: '@samuel.tucker', expected: 'Samuel Tucker'},
            {input: '@samuel', expected: 'Samuel Tucker'},
            {input: '@tucker', expected: 'Samuel Tucker'},
            {input: '@Samuel', expected: 'Samuel Tucker'},
            {input: '@Tucker', expected: 'Samuel Tucker'},
            {input: '@Samuel Tuc', expected: 'Samuel Tucker'},
            {input: '@Samuel Tucker', expected: 'Samuel Tucker'},
            {input: '@Samuel Tucker ', expected: 'Samuel Tucker', withoutSuggestion: true},
        ].forEach((testCase) => {
            verifySuggestionList(testCase);
        });
    });
});
