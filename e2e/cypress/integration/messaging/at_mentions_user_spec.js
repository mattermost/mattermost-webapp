// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

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
    let testUser;

    before(() => {
        // # Login as admin and visit town-square
        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;

            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T1662 Autocomplete should match entries with spaces', () => {
        const fullname = `${testUser.first_name} ${testUser.last_name}`;

        [
            {input: `@${testUser.username}`, expected: fullname, case: 'should match on @username'},
            {input: `@${testUser.first_name.toLowerCase()}`, expected: fullname, case: 'should match on lowercased @firstname'},
            {input: `@${testUser.last_name.toLowerCase()}`, expected: fullname, case: 'should match on lowercased @lastname'},
            {input: `@${testUser.first_name}`, expected: fullname, case: 'should match on @firstname'},
            {input: `@${testUser.last_name}`, expected: fullname, case: 'should match on @lastname'},
            {input: `@${testUser.first_name} ${testUser.last_name.substring(0, testUser.last_name.length - 6)}`, expected: fullname, case: 'should match on partial @fullname'},
            {input: `@${testUser.first_name} ${testUser.last_name}`, expected: fullname, case: 'should match on @fullname'},
            {input: `@${testUser.first_name} ${testUser.last_name} `, expected: fullname, withoutSuggestion: true, case: 'should not match on @fullname with trailing space'},
        ].forEach((testCase) => {
            verifySuggestionList(testCase);
        });
    });
});

describe('Mention self', () => {
    let testUser;

    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;

            cy.apiLogin(testUser);
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('should be always highlighted', () => {
        [
            `@${testUser.username}`,
            `@${testUser.username}.`,
            `@${testUser.username}_`,
            `@${testUser.username}-`,
            `@${testUser.username},`,
        ].forEach((message) => {
            cy.postMessage(message);

            cy.getLastPostId().then((postId) => {
                cy.get(`#postMessageText_${postId}`).find('.mention--highlight');
            });
        });
    });
});
