// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Account Settings > Display > Channel Display Mode', () => {
    before(() => {
        cy.apiLogin('user-1');

        // 1. Set default preference of a user on channel and message display
        cy.apiSaveChannelDisplayModePreference('centered');
        cy.apiSaveMessageDisplayPreference();

        // Post a message to a channel
        cy.visit('/');
        cy.postMessage('Test for channel display mode {enter}');
    });

    beforeEach(() => {
        cy.viewport(1500, 660);
    });

    it('should render in min setting view', () => {
        // 1. Go to Account Settings with "user-1"
        cy.toAccountSettingsModal('user-1');

        // * Check that the Display tab is loaded
        cy.get('#displayButton').should('be.visible');

        // 2. Click the Display tab
        cy.get('#displayButton').click();

        // * Check that it changed into the Display section
        cy.get('#displaySettingsTitle').should('be.visible').should('contain', 'Display Settings');

        // 3. Scroll up to bring Channel Display setting in viewable area.
        cy.get('#channel_display_modeTitle').scrollIntoView();

        // * Check the min setting view if each element is present and contains expected text values
        cy.get('#channel_display_modeTitle').should('be.visible').should('contain', 'Channel Display');
        cy.get('#channel_display_modeDesc').should('be.visible').should('contain', 'Fixed width');
        cy.get('#channel_display_modeEdit').should('be.visible').should('contain', 'Edit');
        cy.get('#accountSettingsHeader > .close').should('be.visible');
    });

    it('should render in max setting view', () => {
        // 3. Click "Edit" to the right of "Channel Display"
        cy.get('#channel_display_modeEdit').click();

        // 4. Scroll a bit to show the "Save" button
        cy.get('.section-max').scrollIntoView();

        // * Check that it changed into the Channel Display section
        // * Check the max setting view if each element is present and contains expected text values
        cy.get('#channel_display_modeFormatA').should('be.visible');
        cy.get('#channel_display_modeFormatB').should('be.visible');
        cy.get('#saveSetting').should('be.visible').should('contain', 'Save');
        cy.get('#cancelSetting').should('be.visible').should('contain', 'Cancel');
        cy.get('#accountSettingsHeader > .close').should('be.visible');
    });

    it('change channel display mode setting to "Full width"', () => {
        // 5. Click the radio button for "Full width"
        cy.get('#channel_display_modeFormatA').click();

        // 6. Click "Save"
        cy.get('#saveSetting').click();

        // * Check that it changed into min setting view
        // * Check if element is present and contains expected text values
        cy.get('#channel_display_modeDesc').should('be.visible').should('contain', 'Full width');

        // 7. Click "x" button to close Account Settings modal
        cy.get('#accountSettingsHeader > .close').click();

        // 8. Go to channel which has any posts
        cy.get('#sidebarItem_town-square').click();

        // * Validate if the post content in center channel is full width
        // by checking the exact class name.
        cy.get('#postContent').first().invoke('attr', 'class').should('contain', 'post__content').should('not.contain', 'center');
    });

    it('AS13225 Channel display mode setting to "Fixed width, centered"', () => {
        // 1. Return to Account Settings modal
        cy.toAccountSettingsModal('user-1', true);

        // * Check that the Sidebar tab is loaded
        cy.get('#displayButton').should('be.visible');

        // 2. Click the display tab
        cy.get('#displayButton').click();

        // 3. Click "Edit" to the right of "Channel Display"
        cy.get('#channel_display_modeEdit').click();

        // 4. Scroll a bit to show the "Save" button
        cy.get('.section-max').scrollIntoView();

        // 5. Click the radio button for "Fixed width, centered"
        cy.get('#channel_display_modeFormatB').click();

        // 6. Click "Save"
        cy.get('#saveSetting').click();

        // * Check that it changed into min setting view
        // * Check if element is present and contains expected text values
        cy.get('#channel_display_modeDesc').should('be.visible').should('contain', 'Fixed width');

        // 7. Click "x" button to close Account Settings modal
        cy.get('#accountSettingsHeader > .close').click();

        // 8. Go to channel which has any posts
        cy.get('#sidebarItem_town-square').click();

        // * Validate if the post content in center channel is fixed and centered
        // by checking the exact class name.
        cy.get('#postContent').first().invoke('attr', 'class').should('contain', 'post__content center');
    });
});
