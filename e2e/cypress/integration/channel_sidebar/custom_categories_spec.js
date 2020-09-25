// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channel_sidebar

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

        // # Close "What's new" modal
        cy.uiCloseWhatsNewModal();
    });

    it('MM-T3161_1 should create a new category from sidebar menu', () => {
        const categoryName = createCategoryFromSidebarMenu();

        // * check if the category exists
        cy.get(`button[aria-label='${categoryName}']`).should('contain', categoryName);
    });

    it('MM-T3161_2 should create a new category from category menu', () => {
        const categoryName = createCategoryFromSidebarMenu();

        // # create a category from category menu
        cy.get(`button[aria-label='${categoryName}']`).parents('.SidebarChannelGroup').within(() => {
            cy.get('.SidebarMenu').invoke('show').get('.SidebarMenu_menuButton').click();
            cy.get('.icon-folder-plus-outline').parents('button').click();
        });

        const newCategoryName = `category-${getRandomId()}`;
        cy.get('#editCategoryModal input').type(newCategoryName).type('{enter}');

        // * check if the newly created category exists
        cy.get(`button[aria-label='${newCategoryName}']`).should('contain', newCategoryName);
    });

    it('MM-T3161_3 move an existing channel to a new category', () => {
        const newCategoryName = `category-${getRandomId()}`;

        // # move to a new category
        cy.get('#sidebarItem_off-topic').parent().then((element) => {
            // # get id of the channel
            const id = element[0].getAttribute('data-rbd-draggable-id');
            cy.get('#sidebarItem_off-topic').parent('li').within(() => {
                // # open dropown next to channel name
                cy.get('.SidebarMenu').invoke('show').get('.SidebarMenu_menuButton').click();

                // # open sub menu
                cy.get(`#moveTo-${id}`).parent('.SubMenuItem').trigger('mouseover');

                // # click on move to new category
                cy.get(`#moveToNewCategory-${id}`).parent('.SubMenuItem').click();
            });
        });
        cy.get('#editCategoryModal input').type(newCategoryName).type('{enter}');

        // * check if the newly created category exists
        cy.get(`button[aria-label='${newCategoryName}']`).should('contain', newCategoryName);
    });

    it('MM-T3163 Rename a category', () => {
        const categoryName = createCategoryFromSidebarMenu();
        cy.get(`button[aria-label='${categoryName}']`).should('contain', categoryName);
        cy.get(`button[aria-label='${categoryName}']`).parents('.SidebarChannelGroup').then((element) => {
            // # get id of the category
            const id = element[0].getAttribute('data-rbd-draggable-id');
            cy.get(`button[aria-label='${categoryName}']`).parents('.SidebarChannelGroup').within(() => {
                cy.get('.SidebarMenu').invoke('show').get('.SidebarMenu_menuButton').click();

                // # click on rename menu item
                cy.get(`#rename-${id}`).click();
            });

            const renameCategory = `category-${getRandomId()}`;

            // # rename category
            cy.get('#editCategoryModal input').clear().type(renameCategory).type('{enter}');

            // * check if the previous category exist
            cy.get(`button[aria-label='${categoryName}']`).should('not.exist');

            // * check if the renamed category exists
            cy.get(`button[aria-label='${renameCategory}']`).should('contain', renameCategory);
        });
    });

    it('MM-T3165 Delete a category', () => {
        const categoryName = createCategoryFromSidebarMenu();
        cy.get(`button[aria-label='${categoryName}']`).should('contain', categoryName);
        cy.get(`button[aria-label='${categoryName}']`).parents('.SidebarChannelGroup').then((element) => {
            // # get id of the category
            const id = element[0].getAttribute('data-rbd-draggable-id');
            cy.get(`button[aria-label='${categoryName}']`).parents('.SidebarChannelGroup').within(() => {
                cy.get('.SidebarMenu').invoke('show').get('.SidebarMenu_menuButton').click();

                // # click on delete menu item
                cy.get(`#delete-${id}`).click();
            });

            // # click on delete button
            cy.get('.GenericModal__button.delete').click();

            // * check if the deleted category exists
            cy.get(`button[aria-label='${categoryName}']`).should('not.exist');
        });
    });
});

function createCategoryFromSidebarMenu() {
    // # Start with a new category
    const categoryName = `category-${getRandomId()}`;

    // # Click on the siebar menu dropdown
    cy.get('.AddChannelDropdown_dropdownButton').click();

    // # Click on create category link
    cy.get('#createCategory').click();

    // # Enter category name and hit enter
    cy.get('#editCategoryModal input').type(categoryName).type('{enter}');
    return categoryName;
}
