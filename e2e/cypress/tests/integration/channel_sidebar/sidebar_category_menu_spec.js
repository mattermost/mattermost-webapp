// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channel_sidebar

describe('Sidebar category menu', () => {
    before(() => {
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T3171_1 Verify that the 3-dot menu on the Channels Category contains an option to Create New Category', () => {
        // # Show the 3-dot and mouseover
        cy.get('.SidebarChannelGroupHeader:contains(CHANNELS) .SidebarMenu').invoke('show').get('.SidebarChannelGroupHeader:contains(CHANNELS) .SidebarMenu_menuButton').should('be.visible').trigger('mouseover');

        // * Verify tooltip is shown
        cy.get('#new-group-tooltip:contains(Category options)').should('be.visible');

        // # Click on the 3-dot menu
        cy.get('.SidebarChannelGroupHeader:contains(CHANNELS) .SidebarMenu_menuButton').should('be.visible').click({force: true});

        // * Verify that Create New Category exists
        cy.get('.SidebarChannelGroupHeader:contains(CHANNELS) .SidebarMenu .MenuItem:contains(Create New Category)').should('be.visible');
    });

    it('MM-T3171_2 Verify that the 3-dot menu on the Favourites Category contains an option to Create New Category, and that the Create New Category modal shows', () => {
        // * Verify that the channel starts in the CHANNELS category
        cy.contains('.SidebarChannelGroup', 'CHANNELS').as('channelsCategory');
        cy.get('@channelsCategory').find('#sidebarItem_town-square');

        // # Open the channel menu and select the Favorite option
        cy.get('#sidebarItem_town-square').find('.SidebarMenu_menuButton').click({force: true});
        cy.get('.SidebarMenu').contains('.MenuItem', 'Favorite').click();

        // * Verify that the channel has moved to the FAVORITES category
        cy.contains('.SidebarChannelGroup', 'FAVORITES').find('#sidebarItem_town-square');

        // # Show the 3-dot and mouseover
        cy.get('.SidebarChannelGroupHeader:contains(FAVORITES) .SidebarMenu').invoke('show').get('.SidebarChannelGroupHeader:contains(FAVORITES) .SidebarMenu_menuButton').should('be.visible').trigger('mouseover');

        // * Verify tooltip is shown
        cy.get('#new-group-tooltip:contains(Category options)').should('be.visible');

        // # Click on the 3-dot menu
        cy.get('.SidebarChannelGroupHeader:contains(FAVORITES) .SidebarMenu_menuButton').should('be.visible').click({force: true});

        // # Verify that Create New Category exists and click on it
        cy.get('.SidebarChannelGroupHeader:contains(FAVORITES) .SidebarMenu .MenuItem:contains(Create New Category)').should('be.visible').click();

        // * Verify that the Create New Category modal appears
        cy.get('#editCategoryModal').should('be.visible');
    });
});
