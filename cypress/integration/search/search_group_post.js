// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/*eslint max-nested-callbacks: ["error", 3]*/

import users from '../../fixtures/users.json';

/**
 * create new group DM channel
 * @param {String} {String} text - DM channel name1, DM channel name2
 */

function createNewPrivateGroupChannel(channelname1, channelname2) {
    cy.get('#addDirectChannel').scrollIntoView().click();

    cy.get('#selectItems').within(() => {
        cy.get('input[type="text"]').scrollIntoView().type(channelname1, {force: true});
    });
    cy.get('div .clickable').children().contains(channelname1).click({force: true});
    cy.get('div .clickable').children().contains(channelname2).click({force: true});
    cy.get('#saveItems').click();
}

describe('Search in GMs', () => {
    it('S14673 Search "in:[username]" returns results in GMs', () => {
        // # Login and navigate to the app
        cy.apiLogin('sysadmin');
        cy.visit('/');
        const message = 'Hello' + Date.now();

        // # Ensure Direct Message is visible in LHS sidebar
        cy.get('#directChannel').scrollIntoView().should('be.visible');

        // # Create new group DM channel with user emails
        createNewPrivateGroupChannel(users['user-2'].email, users['user-1'].email);

        // # Post message to user group
        cy.postMessage(message + '{enter}');

        // # Type `in:` in searchbox
        cy.get('#searchBox').type('in:');

        // # Select users from suggestion list
        cy.contains('.search-autocomplete__item', `@${users.sysadmin.username},${users['user-1'].username},${users['user-2'].username}`).click();

        // # Validate searchbox contains the username
        cy.get('#searchBox').should('have.value', 'in:@' + users.sysadmin.username + ',' + users['user-1'].username + ',' +
            users['user-2'].username + ' ');

        // # Press Enter in searchbox
        cy.get('#searchBox').type(message).type('{enter}');

        // # Search message in each filtered result
        cy.get('#search-items-container').find('.search-highlight').each(($el) => {
            cy.wrap($el).should('have.text', message);
        });
    });
});
