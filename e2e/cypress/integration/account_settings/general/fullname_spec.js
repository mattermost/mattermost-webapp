// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Account Settings > Sidebar > General', () => {
    before(() => {
        cy.apiLogin('user-1');

        cy.visit('/');
        cy.get('#channel_view').should('be.visible');
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#accountSettings').should('be.visible').click();
        cy.get('#accountSettingsModal').should('be.visible');

        // # Go to Account Settings with "user-1"
        cy.toAccountSettingsModal('user-1');

        // # Click General button
        cy.get('#generalButton').click();

        // # Open Full Name section
        cy.get('#nameDesc').click();

        // * Set first name value
        cy.get('#firstName').clear().type('정트리나/trina.jung/집단사무국(CO)');

        // # save form
        cy.get('#saveSetting').click();
    });

    it('M17459 - Filtering by first name with Korean characters', () => {
        cy.apiLogin('user-2');

        cy.visit('/ad-1/channels/town-square');

        // # type in user`s firstName substring
        cy.get('#post_textbox').clear().type('@정트리나');

        // * verify that suggestion list is visible and has value
        cy.get('.suggestion-list__divider').
            find('span').
            last().
            should('be.visible').
            and('have.text', 'Channel Members');

        // * verify that user listed in popup
        cy.get('.mention--align').
            should('be.visible').
            and('have.text', '@user-1');

        // # click enter in chat input
        cy.get('#post_textbox').type('{enter}');

        // # verify that after enter user`s username match
        cy.get('#post_textbox').should('have.value', '@user-1 ');

        // # click enter in chat input
        cy.get('#post_textbox').type('{enter}');

        // # verify that message has been post in chat
        cy.get('[data-mention="user-1"]').
            last().
            scrollIntoView().
            should('be.visible');
    });
});
