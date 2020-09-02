// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channel_sidebar

import {testWithConfig} from '../../support/hooks';

import {getRandomId} from '../../utils';

describe('New category badge', () => {
    testWithConfig({
        ServiceSettings: {
            ExperimentalChannelSidebarOrganization: 'default_on',
        },
    });

    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T3312 should show the new badge until a channel is added to the category', () => {
        const categoryName = `new-${getRandomId()}`;

        // # Click the New Channel Dropdown button
        cy.get('.AddChannelDropdown_dropdownButton').click();

        // # Click the Create New Category dropdown item
        cy.get('.AddChannelDropdown').contains('.MenuItem', 'Create New Category').click();

        // # Fill in the category name and click Create
        cy.get('input[placeholder="Name your category"]').type(categoryName);
        cy.contains('button', 'Create').click();

        // * Verify that the new category has been added to the sidebar and that it has the required badge and drop target
        cy.contains('.SidebarChannelGroup', categoryName).as('newCategory');
        cy.get('@newCategory').should('be.visible');
        cy.get('@newCategory').find('.SidebarCategory_newLabel').should('be.visible');
        cy.get('@newCategory').find('.SidebarCategory_newDropBox').should('be.visible');

        // # Move Town Square into the new category
        cy.get('#sidebarItem_town-square').find('.SidebarMenu_menuButton').click({force: true});
        cy.get('.SidebarMenu').contains('.SubMenuItem', 'Move to').contains(categoryName).click({force: true});

        // * Verify that Town Square has moved into the new category
        cy.contains('.SidebarChannelGroup', categoryName).as('newCategory');
        cy.get('@newCategory').find('#sidebarItem_town-square').should('exist');

        // * Verify that the new category badge and drop target have been removed
        cy.get('@newCategory').find('.SidebarCategory_newLabel').should('not.exist');
        cy.get('@newCategory').find('.SidebarCategory_newDropBox').should('not.exist');

        // # Move Town Square out of the new category
        cy.get('#sidebarItem_town-square').find('.SidebarMenu_menuButton').click({force: true});
        cy.get('.SidebarMenu').contains('.SubMenuItem', 'Move to').contains('Channels').click({force: true});

        // * Verify that Town Square has moved out of the new category
        cy.get('@newCategory').find('#sidebarItem_town-square').should('not.exist');

        // * Verify that the new category badge and drop target did not reappear
        cy.get('@newCategory').find('.SidebarCategory_newLabel').should('not.exist');
        cy.get('@newCategory').find('.SidebarCategory_newDropBox').should('not.exist');
    });
});
