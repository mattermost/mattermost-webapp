// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @account_setting

describe('Account Settings > Display > Channel Display Mode', () => {
    before(() => {
        // # Login as new user, visit town-square and post a message
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
            cy.postMessage('Test for channel display mode');
        });
    });

    beforeEach(() => {
        cy.viewport(1500, 660);
    });

    it('should render in min setting view', () => {
        // # Go to Account Settings
        cy.toAccountSettingsModal();

        // * Check that the Display tab is loaded
        cy.get('#displayButton').should('be.visible');

        // # Click the Display tab
        cy.get('#displayButton').click();

        // * Check that it changed into the Display section
        cy.get('#displaySettingsTitle').should('be.visible').should('contain', 'Display Settings');

        // # Scroll up to bring Channel Display setting in viewable area.
        cy.get('#channel_display_modeTitle').scrollIntoView();

        // * Check the min setting view if each element is present and contains expected text values
        cy.get('#channel_display_modeTitle').should('be.visible').should('contain', 'Channel Display');
        cy.get('#channel_display_modeDesc').should('be.visible').should('contain', 'Full width');
        cy.get('#channel_display_modeEdit').should('be.visible').should('contain', 'Edit');
        cy.get('#accountSettingsHeader > .close').should('be.visible');
    });

    it('should render in max setting view', () => {
        // # Click "Edit" to the right of "Channel Display"
        cy.get('#channel_display_modeEdit').click();

        // # Scroll a bit to show the "Save" button
        cy.get('.section-max').scrollIntoView();

        // * Check that it changed into the Channel Display section
        // * Check the max setting view if each element is present and contains expected text values
        cy.get('#channel_display_modeFormatA').should('be.visible');
        cy.get('#channel_display_modeFormatB').should('be.visible');
        cy.get('#saveSetting').should('be.visible').should('contain', 'Save');
        cy.get('#cancelSetting').should('be.visible').should('contain', 'Cancel');
        cy.get('#accountSettingsHeader > .close').should('be.visible');
    });

    it('MM-T296 change channel display mode setting to "Full width"', () => {
        // # Click the radio button for "Full width"
        cy.get('#channel_display_modeFormatA').click();

        // # Click "Save"
        cy.get('#saveSetting').click();

        // * Check that it changed into min setting view
        // * Check if element is present and contains expected text values
        cy.get('#channel_display_modeDesc').should('be.visible').should('contain', 'Full width');

        // # Click "x" button to close Account Settings modal
        cy.get('#accountSettingsHeader > .close').click();

        // # Go to channel which has any posts
        cy.get('#sidebarItem_town-square').click({force: true});

        // * Validate if the post content in center channel is full width
        // by checking the exact class name.
        cy.get('#postListContent').should('be.visible');
        cy.get("div[data-testid='postContent']").first().invoke('attr', 'class').should('contain', 'post__content').should('not.contain', 'center');
    });

    it('MM-T295 Channel display mode setting to "Fixed width, centered"', () => {
        cy.toAccountSettingsModal();

        // * Check that the Sidebar tab is loaded
        cy.get('#displayButton').should('be.visible');

        // # Click the display tab
        cy.get('#displayButton').click();

        // # Click "Edit" to the right of "Channel Display"
        cy.get('#channel_display_modeEdit').click();

        // # Scroll a bit to show the "Save" button
        cy.get('.section-max').scrollIntoView();

        // # Click the radio button for "Fixed width, centered"
        cy.get('#channel_display_modeFormatB').click();

        // # Click "Save"
        cy.get('#saveSetting').click();

        // * Check that it changed into min setting view
        // * Check if element is present and contains expected text values
        cy.get('#channel_display_modeDesc').should('be.visible').should('contain', 'Fixed width');

        // # Click "x" button to close Account Settings modal
        cy.get('#accountSettingsHeader > .close').click();

        // # Go to channel which has any posts
        cy.get('#sidebarItem_town-square').click({force: true});

        // * Validate if the post content in center channel is fixed and centered
        // by checking the exact class name.
        cy.get('#postListContent').should('be.visible');
        cy.get("div[data-testid='postContent']").first().invoke('attr', 'class').should('contain', 'post__content center');
    });
});
