// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/*eslint max-nested-callbacks: ["error", 5]*/

import users from '../../fixtures/users.json';

const cypressConfig = require('../../../cypress.json');

describe('Search in GMs', () => {
    let testChannel;
    it('S14673 Search "in:[username]" returns results in GMs', () => {
        // # Login and navigate to the app
        cy.apiLogin('sysadmin');
        cy.visit('/');
        const message = 'Hello' + Date.now();

        // # Ensure Direct Message is visible in LHS sidebar
        cy.get('#directChannel').scrollIntoView().should('be.visible');

        cy.getUsers(['user-1', 'user-2']).then((userResponse) => {
            // Safety assertions to make sure we have a valid response
            // expect(userResponse).to.have.property('body').to.have.property('id');
            const user1Id = userResponse.body[0].id;
            const user2Id = userResponse.body[1].id;
            const userEmailArray = [user2Id, user1Id];

            cy.apiCreateGroupChannel(userEmailArray).then((response) => {
                cy.getCurrentTeamName().then((teamName) => {
                    testChannel = response.body;
                    const teamName2 = `${teamName}`.toLowerCase();
                    const url = `${cypressConfig.baseUrl}/${teamName2}/messages/${testChannel.name}`;
                    cy.visit(url);
                    cy.get(`#sidebarItem_${testChannel.name}`).click({force: true});

                    // # Post message to user group
                    cy.postMessage(message + '{enter}');
                });
            });
        });

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
