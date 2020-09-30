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
import {getRandomId} from '../../utils';

describe('Channel sidebar', () => {
    before(() => {
        // # Enable channel sidebar organization
        cy.apiUpdateConfig({
            ServiceSettings: {
                ExperimentalChannelSidebarOrganization: 'default_on',
            },
        });

        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T3161_1 should create a new category from sidebar menu', () => {
        const categoryName = createCategoryFromSidebarMenu();

        // * Check if the category exists
        cy.findByLabelText(categoryName).should('be.visible');
    });

    it('MM-T3161_2 should create a new category from category menu', () => {
        const categoryName = createCategoryFromSidebarMenu();

        // # Create a category from category menu
        cy.findByLabelText(categoryName).should('be.visible').parents('.SidebarChannelGroup').within(() => {
            cy.get('.SidebarMenu').invoke('show').get('.SidebarMenu_menuButton').click();
            cy.get('.icon-folder-plus-outline').parents('button').click();
        });

        const newCategoryName = `category-${getRandomId()}`;
        cy.get('#editCategoryModal input').type(newCategoryName).type('{enter}');

        // * Check if the newly created category exists
        cy.findByLabelText(newCategoryName).should('be.visible');
    });

    it('MM-T3161_3 move an existing channel to a new category', () => {
        const newCategoryName = `category-${getRandomId()}`;

        // # Move to a new category
        cy.get('#sidebarItem_off-topic').parent().then((element) => {
            // # Get id of the channel
            const id = element[0].getAttribute('data-rbd-draggable-id');
            cy.get('#sidebarItem_off-topic').parent('li').within(() => {
                // # Open dropdown next to channel name
                cy.get('.SidebarMenu').invoke('show').get('.SidebarMenu_menuButton').click();

                // # Open sub menu
                cy.get(`#moveTo-${id}`).parent('.SubMenuItem').trigger('mouseover');

                // # Click on move to new category
                cy.get(`#moveToNewCategory-${id}`).parent('.SubMenuItem').click();
            });
        });
        cy.get('#editCategoryModal input').type(newCategoryName).type('{enter}');

        // * Check if the newly created category exists
        cy.findByLabelText(newCategoryName).should('be.visible');
    });

    it('MM-T3163 Rename a category', () => {
        const categoryName = createCategoryFromSidebarMenu();
        cy.findByLabelText(categoryName).should('be.visible').parents('.SidebarChannelGroup').then((element) => {
            // # Get id of the category
            const id = element[0].getAttribute('data-rbd-draggable-id');
            cy.findByLabelText(categoryName).parents('.SidebarChannelGroup').within(() => {
                cy.get('.SidebarMenu').invoke('show').get('.SidebarMenu_menuButton').click();

                // # Click on rename menu item
                cy.get(`#rename-${id}`).click();
            });

            const renameCategory = `category-${getRandomId()}`;

            // # Rename category
            cy.get('#editCategoryModal input').clear().type(renameCategory).type('{enter}');

            // * Check if the previous category exist
            cy.findByLabelText(categoryName).should('not.exist');

            // * Check if the renamed category exists
            cy.findByLabelText(renameCategory).should('be.visible');
        });
    });

    it('MM-T3165 Delete a category', () => {
        const categoryName = createCategoryFromSidebarMenu();
        cy.findByLabelText(categoryName).should('be.visible').parents('.SidebarChannelGroup').then((element) => {
            // # Get id of the category
            const id = element[0].getAttribute('data-rbd-draggable-id');
            cy.findByLabelText(categoryName).should('be.visible').parents('.SidebarChannelGroup').within(() => {
                cy.get('.SidebarMenu').invoke('show').get('.SidebarMenu_menuButton').click();

                // # Click on delete menu item
                cy.get(`#delete-${id}`).click();
            });

            // # Click on delete button
            cy.get('.GenericModal__button.delete').click();

            // * Check if the deleted category exists
            cy.findByLabelText(categoryName).should('not.exist');
        });
    });
});

function createCategoryFromSidebarMenu() {
    // # Start with a new category
    const categoryName = `category-${getRandomId()}`;

    // # Click on the sidebar menu dropdown
    cy.findByLabelText('Add Channel Dropdown').click();

    // # Click on create category link
    cy.findByText('Create New Category').should('be.visible').click();

    // # Verify that Create Category modal has shown up.
    // # Wait for a while until the modal has fully loaded, especially during first-time access.
    cy.get('#editCategoryModal').should('be.visible').wait(TIMEOUTS.HALF_SEC).within(() => {
        cy.findByText('Create New Category').should('be.visible');

        // # Enter category name and hit enter
        cy.findByPlaceholderText('Name your category').should('be.visible').type(categoryName).type('{enter}');
    });

    return categoryName;
}
