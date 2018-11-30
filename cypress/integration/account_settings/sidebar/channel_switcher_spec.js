// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Account Settings > Sidebar > Channel Switcher', () => {
    before(() => {
        // 1. Go to Account Settings with "user-1"
        cy.toAccountSettingsModal('user-1');
    });

    it('should render in min setting view', () => {
        // * Check that the Sidebar tab is loaded
        cy.get('#sidebarButton').should('be.visible');

        // 2. Click the sidebar tab
        cy.get('#sidebarButton').click();

        // * Check that it changed into the Sidebar section
        // * Check the min setting view if each element is present and contains expected text values
        cy.get('#sidebarTitle').should('be.visible').should('contain', 'Sidebar Settings');
        cy.get('#channelSwitcherTitle').should('be.visible').should('contain', 'Channel Switcher');
        cy.get('#channelSwitcherDesc').should('be.visible').should('contain', 'On');
        cy.get('#channelSwitcherEdit').should('be.visible').should('contain', 'Edit');
        cy.get('#accountSettingsHeader > .close').should('be.visible');
    });

    it('should render in max setting view', () => {
        // 3. Click "Edit" to the right of "Channel Switcher"
        cy.get('#channelSwitcherEdit').click();

        // * Check that it changed into the Sidebar section
        // * Check the max setting view if each element is present and contains expected text values
        cy.get('#sidebarTitle').should('be.visible').should('contain', 'Sidebar Settings');
        cy.get('#settingTitle').should('be.visible').should('contain', 'Channel Switcher');
        cy.get('#channelSwitcherRadioOn').should('be.visible').should('contain', 'On');
        cy.get('#channelSwitcherSectionEnabled').should('be.visible');
        cy.get('#channelSwitcherRadioOff').should('be.visible').should('contain', 'Off');
        cy.get('#channelSwitcherSectionOff').should('be.visible');
        cy.get('#channelSwitcherHelpText').should('be.visible').should('contain', 'The channel switcher is shown at the bottom of the sidebar and is used to jump between channels quickly. It can also be accessed using');
        cy.get('#saveSetting').should('be.visible').should('contain', 'Save');
        cy.get('#cancelSetting').should('be.visible').should('contain', 'Cancel');
        cy.get('#accountSettingsHeader > .close').should('be.visible');
    });

    it('change channel setting to Off', () => {
        // 4. Click the radio button for "Off"
        cy.get('#channelSwitcherSectionOff').click();

        // 5. Click "Save"
        cy.get('#saveSetting').click();

        // * Check that it changed into min setting view
        // * Check if element is present and contains expected text values
        cy.get('#channelSwitcherDesc').should('be.visible').should('contain', 'Off');

        // 6. Click "x" button to close Account Settings modal
        cy.get('#accountSettingsHeader > .close').click();

        // * Channel Switcher button should disappear from the bottom of the left-hand-side bar
        cy.get('#sidebarSwitcherButton').should('be.not.visible');
    });

    it('change channel setting to On', () => {
        // 1. Return to Account Settings modal
        cy.toAccountSettingsModal('user-1', true);

        // * Check that the Sidebar tab is loaded
        cy.get('#sidebarButton').should('be.visible');

        // 2. Click the sidebar tab
        cy.get('#sidebarButton').click();

        // 3. Click "Edit" to the right of "Channel Switcher"
        cy.get('#channelSwitcherEdit').click();

        // 4. Click the radio button for "On"
        cy.get('#channelSwitcherSectionEnabled').click();

        // 5. Click "Save"
        cy.get('#saveSetting').click();

        // * Check that it changed into min setting view
        // * Check if element is present and contains expected text values
        cy.get('#channelSwitcherDesc').should('be.visible').should('contain', 'On');

        // 6. Click "x" button to close Account Settings modal
        cy.get('#accountSettingsHeader > .close').click();

        // * Channel Switcher button should appear at the bottom of the left-hand-side bar
        cy.get('#sidebarSwitcherButton').should('be.visible');
    });
});
