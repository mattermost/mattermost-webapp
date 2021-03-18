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

import {clickCategoryMenuItem} from './helpers';

let testTeam;
let testUser;

describe('Channel sidebar', () => {
    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team, user}) => {
            testTeam = team;
            testUser = user;
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    // it('MM-T3161_1 should create a new category from sidebar menu', () => {
    //     const categoryName = createCategoryFromSidebarMenu();

    //     // * Check if the category exists
    //     cy.findByLabelText(categoryName).should('be.visible');
    // });

    // it('MM-T3161_2 should create a new category from category menu', () => {
    //     const categoryName = createCategoryFromSidebarMenu();

    //     // # Create new category from category menu
    //     clickCategoryMenuItem(categoryName, 'Create New Category');

    //     const newCategoryName = `category-${getRandomId()}`;
    //     cy.get('#editCategoryModal input').type(newCategoryName).type('{enter}');

    //     // * Check if the newly created category exists
    //     cy.findByLabelText(newCategoryName).should('be.visible');
    // });

    // it('MM-T3161_3 move an existing channel to a new category', () => {
    //     const newCategoryName = `category-${getRandomId()}`;

    //     // # Move to a new category
    //     cy.get('#sidebarItem_off-topic').parent().then((element) => {
    //         // # Get id of the channel
    //         const id = element[0].getAttribute('data-rbd-draggable-id');
    //         cy.get('#sidebarItem_off-topic').parent('li').within(() => {
    //             // # Open dropdown next to channel name
    //             cy.get('.SidebarMenu').invoke('show').get('.SidebarMenu_menuButton').should('be.visible').click({force: true});

    //             // # Open sub menu
    //             cy.get(`#moveTo-${id}`).parent('.SubMenuItem').trigger('mouseover');

    //             // # Click on move to new category
    //             cy.get(`#moveToNewCategory-${id}`).parent('.SubMenuItem').click();
    //         });
    //     });
    //     cy.get('#editCategoryModal input').type(newCategoryName).type('{enter}');

    //     // * Check if the newly created category exists
    //     cy.findByLabelText(newCategoryName).should('be.visible');
    // });

    // it('MM-T3163 Rename a category', () => {
    //     const categoryName = createCategoryFromSidebarMenu();

    //     // # Rename category from category menu
    //     clickCategoryMenuItem(categoryName, 'Rename Category');

    //     const renameCategory = `category-${getRandomId()}`;

    //     // # Rename category
    //     cy.get('#editCategoryModal input').clear().type(renameCategory).type('{enter}');

    //     // * Check if the previous category exist
    //     cy.findByLabelText(categoryName).should('not.exist');

    //     // * Check if the renamed category exists
    //     cy.findByLabelText(renameCategory).should('be.visible');
    // });

    // it('MM-T3165 Delete a category', () => {
    //     const categoryName = createCategoryFromSidebarMenu();

    //     // # Delete category from category menu
    //     clickCategoryMenuItem(categoryName, 'Delete Category');

    //     // # Click on delete button
    //     cy.get('.GenericModal__button.delete').click();

    //     // * Check if the deleted category exists
    //     cy.findByLabelText(categoryName).should('not.exist');
    // });

    // it('MM-T3916 Create Category character limit', () => {
    //     // # Click on the sidebar menu dropdown
    //     cy.findByLabelText('Add Channel Dropdown').click();

    //     // # Click on create category link
    //     cy.findByText('Create New Category').should('be.visible').click();

    //     // # Add a name 26 characters in length e.g `abcdefghijklmnopqrstuvwxyz`
    //     cy.get('#editCategoryModal').should('be.visible').wait(TIMEOUTS.HALF_SEC).within(() => {
    //         cy.findByText('Create New Category').should('be.visible');

    //         // # Enter category name
    //         cy.findByPlaceholderText('Name your category').should('be.visible').type('abcdefghijklmnopqrstuvwxyz');
    //     });

    //     // * Verify error state and negative character count at the end of the textbox based on the number of characters the user has exceeded
    //     cy.get('#editCategoryModal .MaxLengthInput.has-error').should('be.visible');
    //     cy.get('#editCategoryModal .MaxLengthInput__validation').should('be.visible').should('contain', '-4');

    //     // * Verify Create button is disabled.
    //     cy.get('#editCategoryModal .GenericModal__button.confirm').should('be.visible').should('be.disabled');

    //     // # Use backspace to remove 4 characters
    //     cy.get('#editCategoryModal .MaxLengthInput').should('be.visible').type('{backspace}{backspace}{backspace}{backspace}');

    //     // * Verify error state and negative character count at the end of the textbox are no longer displaying
    //     cy.get('#editCategoryModal .MaxLengthInput.has-error').should('not.be.visible');
    //     cy.get('#editCategoryModal .MaxLengthInput__validation').should('not.be.visible');

    //     // * Verify Create button is enabled
    //     cy.get('#editCategoryModal .GenericModal__button.confirm').should('be.visible').should('not.be.disabled');

    //     // Click Create
    //     cy.get('#editCategoryModal .GenericModal__button.confirm').should('be.visible').click();

    //     // Verify new category is created
    //     cy.findByLabelText('abcdefghijklmnopqrstuv').should('be.visible');
    // });

    it('MM-T3864 Sticky category headers', () => {
        const categoryName = createCategoryFromSidebarMenu();

        for (let i = 0; i < 10; i++) {
            createChannelAndAddToCategory(categoryName);
            cy.get('#SidebarContainer .scrollbar--view').scrollTo('bottom', {ensureScrollable: false});
        }

        for (let i = 0; i < 10; i++) {
            createChannelAndAddToFavourites();
            cy.get('#SidebarContainer .scrollbar--view').scrollTo('bottom', {ensureScrollable: false});
        }

        cy.get('#SidebarContainer .scrollbar--view').scrollTo('top', {ensureScrollable: false});
    });
});

function createChannelAndAddToCategory(categoryName) {
    const userId = testUser.id;
    cy.apiCreateChannel(testTeam.id, `channel-${getRandomId()}`, 'New Test Channel').then(({channel}) => {
        // # Add the user to the channel
        cy.apiAddUserToChannel(channel.id, userId).then(() => {
            // # Move to a new category
            cy.get(`#sidebarItem_${channel.name}`).parent().then((element) => {
                // # Get id of the channel
                const id = element[0].getAttribute('data-rbd-draggable-id');
                cy.get(`.SidebarChannelGroup:contains(${categoryName})`).should('be.visible').then((categoryElement) => {
                    const categoryId = categoryElement[0].getAttribute('data-rbd-draggable-id');

                    cy.get(`#sidebarItem_${channel.name}`).parent('li').within(() => {
                        // # Open dropdown next to channel name
                        cy.get('.SidebarMenu').invoke('show').get('.SidebarMenu_menuButton').should('be.visible').click({force: true});

                        // # Open sub menu
                        cy.get(`#moveTo-${id}`).parent('.SubMenuItem').trigger('mouseover');

                        // # Click on move to new category
                        cy.get(`#moveToCategory-${id}-${categoryId}`).parent('.SubMenuItem').click();
                    });
                });
            });
        });
    });
}

function createChannelAndAddToFavourites() {
    const userId = testUser.id;
    cy.apiCreateChannel(testTeam.id, `channel-${getRandomId()}`, 'New Test Channel').then(({channel}) => {
        // # Add the user to the channel
        cy.apiAddUserToChannel(channel.id, userId).then(() => {
            // # Move to a new category
            cy.get(`#sidebarItem_${channel.name}`).parent().then((element) => {
                // # Get id of the channel
                const id = element[0].getAttribute('data-rbd-draggable-id');
                cy.get(`#sidebarItem_${channel.name}`).parent('li').within(() => {
                    // # Open dropdown next to channel name
                    cy.get('.SidebarMenu').invoke('show').get('.SidebarMenu_menuButton').should('be.visible').click({force: true});

                    // # Favourite the channel
                    cy.get(`#favorite-${id} button`).should('be.visible').click({force: true});
                });
            });
        });
    });
}

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
