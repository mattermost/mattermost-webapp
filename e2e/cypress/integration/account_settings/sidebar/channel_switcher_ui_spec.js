// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @account_setting @not_cloud

describe('Account Settings > Sidebar > Channel Switcher', () => {
    before(() => {
        cy.shouldNotRunOnCloudEdition();

        // # Update config
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableLegacySidebar: true,
            },
        });

        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    beforeEach(() => {
        // # Go to Account Settings
        cy.reload();
        cy.toAccountSettingsModal();
    });

    it('should render in min setting view', () => {
        // * Check that the Sidebar tab is loaded, then click
        cy.get('#sidebarButton').should('be.visible').click();

        // * Check that it changed into the Sidebar section
        // * Check the min setting view if each element is present and contains expected text values
        cy.get('#sidebarTitle').should('be.visible').should('contain', 'Sidebar Settings');
        cy.get('#channelSwitcherTitle').should('be.visible').should('contain', 'Channel Switcher');
        cy.get('#channelSwitcherDesc').should('be.visible').should('contain', 'On');
        cy.get('#channelSwitcherEdit').should('be.visible').should('contain', 'Edit');
        cy.get('#accountSettingsHeader > .close').should('be.visible').click();
    });

    it('should render in max setting view', () => {
        // * Check that the Sidebar tab is loaded, then click
        cy.get('#sidebarButton').should('be.visible').click();

        // # Click "Edit" to the right of "Channel Switcher"
        cy.get('#channelSwitcherEdit').should('be.visible').click();

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
        cy.get('#accountSettingsHeader > .close').should('be.visible').click();
    });

    it('MM-T265_1 Hide Channel Switcher button in LHS', () => {
        // * Check that the Sidebar tab is loaded, then click
        cy.get('#sidebarButton').should('be.visible').click();

        // # Click "Edit" to the right of "Channel Switcher"
        cy.get('#channelSwitcherEdit').should('be.visible').click();

        // # Click the radio button for "Off"
        cy.get('#channelSwitcherSectionOff').should('be.visible').click();

        // # Click "Save"
        cy.get('#saveSetting').should('be.visible').click();

        // * Check that it changed into min setting view
        // * Check if element is present and contains expected text values
        cy.get('#channelSwitcherDesc').should('be.visible').should('contain', 'Off');

        // # Click "x" button to close Account Settings modal
        cy.get('#accountSettingsHeader > .close').should('be.visible').click();

        // * Channel Switcher button should disappear from the bottom of the left-hand-side bar
        cy.get('#sidebarSwitcherButton').should('be.not.visible');
    });

    it('MM-T265_2 Show Channel Switcher button in LHS', () => {
        // * Check that the Sidebar tab is loaded, then click
        cy.get('#sidebarButton').should('be.visible').click();

        // # Click "Edit" to the right of "Channel Switcher"
        cy.get('#channelSwitcherEdit').should('be.visible').click();

        // # Click the radio button for "On"
        cy.get('#channelSwitcherSectionEnabled').should('be.visible').click();

        // # Click "Save"
        cy.get('#saveSetting').should('be.visible').click();

        // * Check that it changed into min setting view
        // * Check if element is present and contains expected text values
        cy.get('#channelSwitcherDesc').should('be.visible').should('contain', 'On');

        // # Click "x" button to close Account Settings modal
        cy.get('#accountSettingsHeader > .close').should('be.visible').click();

        // * Channel Switcher button should appear at the bottom of the left-hand-side bar
        cy.get('#sidebarSwitcherButton').should('be.visible');
    });
});
