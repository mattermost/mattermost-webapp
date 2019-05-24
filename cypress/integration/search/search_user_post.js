// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/*eslint max-nested-callbacks: ["error", 3]*/

import users from '../../fixtures/users.json';

describe('Search in DMs', () => {
    it('S14672 Search "in:[username]" returns results in DMs', () => {
        // # Login and navigate to the app
        cy.apiLogin('user-1');
        cy.visit('/');
        const message = 'Hello';

        // # Ensure Direct Message is visible in LHS sidebar
        cy.get('#sidebarChannelContainer ul li #directChannel').scrollIntoView().should('be.visible');

        // # Create new DM channel with user's email
        cy.createNewDMChannel(users['user-2'].email);

        // # Post message to user
        cy.postMessage(message + '{enter}');

        // # Type `in:` in searchbox
        cy.get('#searchBox').type('in:');

        // # Select user from suggestion list
        cy.get('#search-autocomplete__popover').within(() => {
            cy.contains(users['user-2'].username).click();
        });

        // # Validate searchbox contains the username
        cy.get('#searchBox').should('have.value', 'in:@' + users['user-2'].username + ' ');

        // # Press Enter in searchbox
        cy.get('#searchBox').type(message).type('{enter}');

        // # Search message in each filtered result
        cy.get('#search-items-container').find('.search-item__container').each(($el) => {
            cy.wrap($el).find('.search-highlight').should('have.text', message);
        });
    });
});
