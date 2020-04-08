// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @search

/**
 * create new DM channel
 * @param {String} text - DM channel name
 */
function createNewDMChannel(channelname) {
    cy.get('#addDirectChannel').scrollIntoView().click();

    cy.get('#selectItems').within(() => {
        cy.get('input[type="text"]').scrollIntoView().type(channelname, {force: true});
    });

    cy.contains('.more-modal__description', channelname).click({force: true});
    cy.get('#saveItems').click();
}

describe('Search in DMs', () => {
    let testUser;

    beforeEach(() => {
        cy.apiGetTeamByName('ad-1').then((res) => {
            cy.apiCreateNewUser({}, [res.body.id]).then((user) => {
                testUser = user;
            });
        });
    });

    it('S14672 Search "in:[username]" returns results in DMs', () => {
        // # Login and navigate to the app
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');
        const message = 'Hello' + Date.now();

        // # Ensure Direct Message is visible in LHS sidebar
        cy.get('#directChannel').scrollIntoView().should('be.visible');

        // # Create new DM channel with user's email
        createNewDMChannel(testUser.email);

        // # Post message to user
        cy.postMessage(message);

        // # Type `in:` in searchbox
        cy.get('#searchBox').type('in:');

        // # Select user from suggestion list
        cy.contains('.search-autocomplete__item', `@${testUser.username}`).scrollIntoView().click();

        // # Validate searchbox contains the username
        cy.get('#searchBox').should('have.value', 'in:@' + testUser.username + ' ');

        // # Press Enter in searchbox
        cy.get('#searchBox').type(message).type('{enter}');

        // # Search message in each filtered result
        cy.get('#search-items-container').find('.search-highlight').each(($el) => {
            cy.wrap($el).should('have.text', message);
        });
    });
});
