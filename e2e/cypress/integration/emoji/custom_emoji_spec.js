// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Custom emojis', () => {
    before(() => {
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');
    });

    it('MM-9777 User cant add custom emoji with the same name as a system one', async () => {
        // #Open sidebar
        cy.get('#sidebarHeaderDropdownButton').click();

        // # Click on custom emojis
        cy.get('#customEmojis').should('be.visible').click();

        // # Click on add new emoji
        cy.get('.btn-primary').click();

        // # Type croissant name and click on save
        cy.get('#name').type('croissant');
        cy.get('.backstage-form__footer').within(($form) => {
            cy.wrap($form).find('.btn-primary').click();

            // # Check for error saying that the croissant icon is a system one
            cy.wrap($form).find('.has-error').should('be.visible').and('have.text', 'This name is already in use by a system emoji. Please choose another name.');
        });
    });
});
