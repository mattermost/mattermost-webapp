// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channel_sidebar

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Category sorting', () => {
    beforeEach(() => {
        // # Login as test user and visit town-square
        cy.apiAdminLogin();
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T3916 Create Category character limit', () => {
        // # Click on the sidebar menu dropdown
        cy.findByLabelText('Add Channel Dropdown').click();

        // # Click on create category link
        cy.findByText('Create New Category').should('be.visible').click();

        // # Add a name 26 characters in length e.g `abcdefghijklmnopqrstuvwxyz`
        cy.get('#editCategoryModal').should('be.visible').wait(TIMEOUTS.HALF_SEC).within(() => {
            cy.findByText('Create New Category').should('be.visible');

            // # Enter category name
            cy.findByPlaceholderText('Name your category').should('be.visible').type('abcdefghijklmnopqrstuvwxyz');
        });

        // * Verify error state and negative character count at the end of the textbox based on the number of characters the user has exceeded
        cy.get('#editCategoryModal .MaxLengthInput.has-error').should('be.visible');
        cy.get('#editCategoryModal .MaxLengthInput__validation').should('be.visible').should('contain', '-4');

        // * Verify Create button is disabled.
        cy.get('#editCategoryModal .GenericModal__button.confirm').should('be.visible').should('be.disabled');

        // # Use backspace to remove 4 characters
        cy.get('#editCategoryModal .MaxLengthInput').should('be.visible').type('{backspace}{backspace}{backspace}{backspace}');

        // * Verify error state and negative character count at the end of the textbox are no longer displaying
        cy.get('#editCategoryModal .MaxLengthInput.has-error').should('not.exist');
        cy.get('#editCategoryModal .MaxLengthInput__validation').should('not.exist');

        // * Verify Create button is enabled
        cy.get('#editCategoryModal .GenericModal__button.confirm').should('be.visible').should('not.be.disabled');

        // Click Create
        cy.get('#editCategoryModal .GenericModal__button.confirm').should('be.visible').click();

        // Verify new category is created
        cy.findByLabelText('abcdefghijklmnopqrstuv').should('be.visible');
    });
});
