// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

const groupMembers = ['aaron.peterson', 'aaron.ward', 'samuel.tucker'];

describe('Search', () => {
    before(() => {
        cy.apiLogin('user-1');
        cy.apiSaveTeammateNameDisplayPreference('username');

        cy.apiGetUsers(groupMembers).then((res) => {
            const userIds = res.body.map((user) => user.id);

            cy.apiCreateGroupChannel(userIds).then((resp) => {
                cy.visit(`/ad-1/messages/${resp.body.name}`);
            });
        });
    });

    it('S14673 - Search "in:[username]" returns results in GMs', () => {
        const message = `hello${Date.now()}`;

        // # Post a message
        cy.postMessage(message);

        //# Type "in:" text in search input
        cy.get('#searchBox').type('in:');

        //# Search group members in the menu
        cy.getAllByTestId('listItem').contains(groupMembers.join(',')).click();

        //# Press enter to select
        cy.get('#searchBox').type('{enter}');

        //# Search for the message
        cy.get('#searchBox').clear().type(`${message}{enter}`);

        // * Should return exactly one result from the group channel and matches the message
        cy.queryAllByTestId('search-item-container').should('be.visible').and('have.length', 1).within(() => {
            cy.get('.search-channel__name').should('be.visible').and('have.text', groupMembers.join(', '));
            cy.get('.search-highlight').should('be.visible').and('have.text', message);
        });
    });
});
