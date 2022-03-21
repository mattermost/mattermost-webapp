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

let testTeam;
let testUser;

describe('Category sorting', () => {
    beforeEach(() => {
        // # Login as test user and visit town-square
        cy.apiAdminLogin();
        cy.apiInitSetup({loginAfter: true}).then(({team, user}) => {
            testTeam = team;
            testUser = user;
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T3834 Category sorting', () => {
        const channelNames = [];
        const categoryName = createCategoryFromSidebarMenu();

        // # Create 5 channels and add them to a custom category
        for (let i = 0; i < 5; i++) {
            channelNames.push(createChannelAndAddToCategory(categoryName));
            cy.get('#SidebarContainer .scrollbar--view').scrollTo('bottom', {ensureScrollable: false});
        }

        // # Sort alphabetically
        cy.get(`.SidebarChannelGroupHeader:contains(${categoryName})`).within(() => {
            // # Open dropdown next to channel name
            cy.get('.SidebarMenu').invoke('show').get('.SidebarMenu_menuButton').should('be.visible').click({force: true});

            // # Open sub menu
            cy.get('#sortChannels').parent('.SubMenuItem').trigger('mouseover');

            // # Click on sort alphabetically
            cy.get('#sortAlphabetical').parent('.SubMenuItem').click();
        });

        // * Verify channels are sorted alphabetically
        verifyAlphabeticalSortingOrder(categoryName, channelNames.length);

        // # Add another channel
        channelNames.push(createChannelAndAddToCategory(categoryName));
        cy.get('#SidebarContainer .scrollbar--view').scrollTo('bottom', {ensureScrollable: false});

        // * Verify channels are still sorted alphabetically
        verifyAlphabeticalSortingOrder(categoryName, channelNames.length);

        // # Sort by recency
        cy.get(`.SidebarChannelGroupHeader:contains(${categoryName})`).within(() => {
            // # Open dropdown next to channel name
            cy.get('.SidebarMenu').invoke('show').get('.SidebarMenu_menuButton').should('be.visible').click({force: true});

            // # Open sub menu
            cy.get('#sortChannels').parent('.SubMenuItem').trigger('mouseover');

            // # Click on sort by recency
            cy.get('#sortByMostRecent').parent('.SubMenuItem').click();
        });

        // # Sort channel names in reverse order that they were created (ie. most recent to least)
        let sortedByRecencyChannelNames = channelNames.concat().reverse();
        for (let i = 0; i < channelNames.length; i++) {
            // * Verify that the channels are in reverse order that they were created
            cy.get(`.SidebarChannelGroup:contains(${categoryName}) .NavGroupContent li:nth-child(${i + 1}) a[id^="sidebarItem_${sortedByRecencyChannelNames[i]}"]`).should('be.visible');
        }

        // # Add another channel
        channelNames.push(createChannelAndAddToCategory(categoryName));
        cy.get('#SidebarContainer .scrollbar--view').scrollTo('bottom', {ensureScrollable: false});

        // # Sort channel names in reverse order that they were created (ie. most recent to least)
        sortedByRecencyChannelNames = channelNames.concat().reverse();
        for (let i = 0; i < channelNames.length; i++) {
            // * Verify that the channels are still in reverse order that they were created
            cy.get(`.SidebarChannelGroup:contains(${categoryName}) .NavGroupContent li:nth-child(${i + 1}) a[id^="sidebarItem_${sortedByRecencyChannelNames[i]}"]`).should('be.visible');
        }

        // # Remove the oldest from the category and put it into Favourites
        cy.get(`.SidebarChannelGroup:contains(${categoryName}) .NavGroupContent a[id^="sidebarItem_${channelNames[0]}"]`).should('be.visible').within(() => {
            // # Open dropdown next to channel name
            cy.get('.SidebarMenu').invoke('show').get('.SidebarMenu_menuButton').should('be.visible').click({force: true});

            // # Open sub menu
            cy.get('li[id^="moveTo-"]').trigger('mouseover');

            // # Click on move to new category
            cy.findByText(/favorites/i).click();
        });

        // * Verify the channel is now in Favourites
        cy.get(`.SidebarChannelGroup:contains(FAVORITES) .NavGroupContent a[id^="sidebarItem_${channelNames[0]}"]`).should('be.visible');
        channelNames.shift();

        // # Sort manually
        cy.get(`.SidebarChannelGroupHeader:contains(${categoryName})`).within(() => {
            // # Open dropdown next to channel name
            cy.get('.SidebarMenu').invoke('show').get('.SidebarMenu_menuButton').should('be.visible').click({force: true});

            // # Open sub menu
            cy.get('#sortChannels').parent('.SubMenuItem').trigger('mouseover');

            // # Click on sort manually
            cy.get('#sortManual').parent('.SubMenuItem').click();
        });

        // # Add another channel
        channelNames.push(createChannelAndAddToCategory(categoryName));
        cy.get('#SidebarContainer .scrollbar--view').scrollTo('bottom', {ensureScrollable: false});

        // * Verify that the channel has been placed at the bottom of the category
        cy.get(`.SidebarChannelGroup:contains(${categoryName}) .NavGroupContent li:nth-child(1) a[id^="sidebarItem_${channelNames[channelNames.length - 1]}"]`).should('be.visible');
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

    // // Commented out since we've had to disable sticky headings because of issues with the menu components
    // it('MM-T3864 Sticky category headers', () => {
    //     const categoryName = createCategoryFromSidebarMenu();

    //     // # Move test channel to Favourites
    //     cy.get(`#sidebarItem_${testChannel.name}`).parent().then((element) => {
    //         // # Get id of the channel
    //         const id = element[0].getAttribute('data-rbd-draggable-id');
    //         cy.get(`#sidebarItem_${testChannel.name}`).parent('li').within(() => {
    //             // # Open dropdown next to channel name
    //             cy.get('.SidebarMenu').invoke('show').get('.SidebarMenu_menuButton').should('be.visible').click({force: true});

    //             // # Favourite the channel
    //             cy.get(`#favorite-${id} button`).should('be.visible').click({force: true});
    //         });
    //     });

    //     // # Create 15 channels and add them to a custom category
    //     for (let i = 0; i < 15; i++) {
    //         createChannelAndAddToCategory(categoryName);
    //         cy.get('#SidebarContainer .scrollbar--view').scrollTo('bottom', {ensureScrollable: false});
    //     }

    //     // # Create 10 channels and add them to Favourites
    //     for (let i = 0; i < 10; i++) {
    //         createChannelAndAddToFavourites();
    //         cy.get('#SidebarContainer .scrollbar--view').scrollTo('bottom', {ensureScrollable: false});
    //     }

    //     // # Scroll to the center of the channel list
    //     cy.get('#SidebarContainer .scrollbar--view').scrollTo('center', {ensureScrollable: false});

    //     // * Verify that both the 'More Unreads' label and the category header are visible
    //     cy.get('#unreadIndicatorTop').should('be.visible');
    //     cy.get('#SidebarContainer .SidebarChannelGroupHeader:contains(FAVORITES)').should('be.visible');

    //     // # Scroll to the bottom of the list
    //     cy.get('#SidebarContainer .scrollbar--view').scrollTo('bottom', {ensureScrollable: false});

    //     // * Verify that the 'More Unreads' label is still visible but the category is not
    //     cy.get('#unreadIndicatorTop').should('be.visible');
    //     cy.get('#SidebarContainer .SidebarChannelGroupHeader:contains(FAVORITES)').should('not.be.visible');
    // });
});

function createChannelAndAddToCategory(categoryName) {
    const channelName = `channel-${getRandomId()}`;
    const userId = testUser.id;
    cy.apiCreateChannel(testTeam.id, channelName, 'New Test Channel').then(({channel}) => {
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
    return channelName;
}

// // Commented out since we've had to disable sticky headings because of issues with the menu components
// function createChannelAndAddToFavourites() {
//     const userId = testUser.id;
//     cy.apiCreateChannel(testTeam.id, `channel-${getRandomId()}`, 'New Test Channel').then(({channel}) => {
//         // # Add the user to the channel
//         cy.apiAddUserToChannel(channel.id, userId).then(() => {
//             // # Move to a new category
//             cy.get(`#sidebarItem_${channel.name}`).parent().then((element) => {
//                 // # Get id of the channel
//                 const id = element[0].getAttribute('data-rbd-draggable-id');
//                 cy.get(`#sidebarItem_${channel.name}`).parent('li').within(() => {
//                     // # Open dropdown next to channel name
//                     cy.get('.SidebarMenu').invoke('show').get('.SidebarMenu_menuButton').should('be.visible').click({force: true});

//                     // # Favourite the channel
//                     cy.get(`#favorite-${id} button`).should('be.visible').click({force: true});
//                 });
//             });
//         });
//     });
// }

function verifyAlphabeticalSortingOrder(categoryName, length) {
    // # Go through each channel to get its name
    const sortedAlphabeticalChannelNames = [];
    for (let i = 0; i < length; i++) {
        // Grab the elements in the order that they appear in the sidebar
        cy.get(`.SidebarChannelGroup:contains(${categoryName}) .NavGroupContent li:nth-child(${i + 1}) .SidebarChannelLinkLabel`).should('be.visible').invoke('text').then((text) => {
            sortedAlphabeticalChannelNames.push(text);

            // # Sort the names manually
            const comparedSortedChannelNames = sortedAlphabeticalChannelNames.concat().sort((a, b) => a.localeCompare(b, 'en', {numeric: true}));

            // * Verify that the sorted order matches the order they were already in
            assert.deepEqual(sortedAlphabeticalChannelNames, comparedSortedChannelNames);
        });
    }
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
