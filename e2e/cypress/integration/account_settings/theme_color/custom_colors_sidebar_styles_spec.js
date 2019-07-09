// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

const testCases = [
    {key: 0, name: 'Sidebar BG', inputTarget: '.hue-horizontal', inputColor: ['background-color', 'rgb(20, 191, 188)'], content: '"sidebarBg":"#14bfbc"'},
    {key: 1, name: 'Sidebar Text', inputTarget: '.saturation-black', inputColor: ['background-color', 'rgb(129, 65, 65)'], content: '"sidebarText":"#814141"'},
    {key: 2, name: 'Sidebar Header BG', inputTarget: '.hue-horizontal', inputColor: ['background-color', 'rgb(17, 171, 168)'], content: '"sidebarHeaderBg":"#11aba8"'},
    {key: 3, name: 'Sidebar Header Text', inputTarget: '.saturation-black', inputColor: ['background-color', 'rgb(129, 65, 65)'], content: '"sidebarHeaderTextColor":"#814141"'},
    {key: 4, name: 'Sidebar Unread Text', inputTarget: '.saturation-black', inputColor: ['background-color', 'rgb(129, 65, 65)'], content: '"sidebarUnreadText":"#814141"'},
    {key: 5, name: 'Sidebar Text Hover BG', inputTarget: '.hue-horizontal', inputColor: ['background-color', 'rgb(69, 191, 191)'], content: '"sidebarTextHoverBg":"#45bfbf"'},
    {key: 6, name: 'Sidebar Text Active Border', inputTarget: '.saturation-black', inputColor: ['background-color', 'rgb(65, 92, 129)'], content: '"sidebarTextActiveBorder":"#415c81"'},
    {key: 7, name: 'Sidebar Text Active Color', inputTarget: '.saturation-black', inputColor: ['background-color', 'rgb(129, 65, 65)'], content: '"sidebarTextActiveColor":"#814141"'},
    {key: 8, name: 'Online Indicator', inputTarget: '.saturation-black', inputColor: ['background-color', 'rgb(65, 129, 113)'], content: '"onlineIndicator":"#418171"'},
    {key: 9, name: 'Away Indicator', inputTarget: '.saturation-black', inputColor: ['background-color', 'rgb(129, 106, 65)'], content: '"awayIndicator":"#816a41"'},
    {key: 10, name: 'Do Not Disturb Indicator', inputTarget: '.saturation-black', inputColor: ['background-color', 'rgb(129, 65, 65)'], content: '"dndIndicator":"#814141"'},
    {key: 11, name: 'Mention Jewel BG', inputTarget: '.saturation-black', inputColor: ['background-color', 'rgb(129, 65, 65)'], content: '"dndIndicator":"#814141"'},
    {key: 12, name: 'Mention Jewel Text', inputTarget: '.saturation-black', inputColor: ['background-color', 'rgb(65, 92, 129)'], content: '"mentionColor":"#415c81"'},
];

// Selects Edit Theme, selects Custom Theme, checks display, selects custom drop-down for color options
function customColors(dropdownInt, dropdownName) {
    cy.get('#themeEdit').scrollIntoView().click();

    cy.get('#customThemes').click();

    // Checking Custom Theme Display
    cy.get('#displaySettingsTitle').scrollIntoView();
    cy.get('.theme-elements__header').should('be.visible', 'contain', 'Sidebar Styles');
    cy.get('.theme-elements__header').should('be.visible', 'contain', 'Center Channel Styles');
    cy.get('.theme-elements__header').should('be.visible', 'contain', 'Link and BUtton Sytles');
    cy.get('.padding-top').should('be.visible', 'contain', 'Import theme Colors from Slack');
    cy.get('#saveSetting').scrollIntoView().should('be.visible', 'contain', 'Save');
    cy.get('#cancelSetting').should('be.visible', 'contain', 'Cancel');

    cy.get('.theme-elements__header').eq(dropdownInt).should('contain', dropdownName).click();
}

describe('AS14318 Theme Colors - Color Picker', () => {
    before(() => {
        //Login and navigating to settings
        cy.apiLogin('user-1');
        cy.toAccountSettingsModal(null, true);
        cy.get('#displayButton').click();
        cy.get('#themeTitle').click();
        cy.get('#customThemes').click();
    });

    after(() => {
        cy.defaultTheme();
    });

    it('Should be able to use color picket and change Sidebar theme color', () => {
        //Access to Sidebar Styles section
        cy.get('#SidebarStyles').click();

        // # Click the Sidebar BG setting
        cy.get('.color-icon:visible').first().click();

        //Filling up input with value #bb123e
        cy.get("input[spellcheck='false']").clear().type('#bb123e');

        //closing modal clicking Sidebar Link
        cy.get('#SidebarStyles').click();

        //saving account settings
        cy.get('#saveSetting').click();

        //access to theme settings one more time
        cy.get('#themeTitle').click();

        //access to custom settings one more time
        cy.get('#customThemes').click();

        //opening Sidebar section again in order to verify change
        cy.get('#SidebarStyles').click();

        //verifying configuration change was performed correctly
        cy.get('.color-icon').should('have.css', 'background-color', 'rgb(187, 18, 62)');
    });

    it('Should be able to use color picket and change Center Channel Styles', () => {
        //Access to center Channel Styles section
        cy.get('#centerChannelStyles').click();

        // # Click the Sidebar BG setting
        cy.get('.color-icon:visible').first().click();

        //Filling up input with value #bb123e
        cy.get("input[spellcheck='false']").clear().type('#bb123e');

        //closing modal clicking Sidebar Link
        cy.get('#SidebarStyles').click();

        //saving account settings
        cy.get('#saveSetting').click();

        //access to theme settings one more time
        cy.get('#themeTitle').click();

        //access to custom settings one more time
        cy.get('#customThemes').click();

        //opening centerChannelStyles section again in order to verify change
        cy.get('#centerChannelStyles').click();

        //verifying configuration change was performed correctly
        cy.get('.color-icon').should('have.css', 'background-color', 'rgb(187, 18, 62)');
    });

    it('Should be able to use color picket and change Link and Button Styles', () => {
        //Access to Link and buttons styles section
        cy.get('#LinkAndButtonsStyles').click();

        // # Click the Sidebar BG setting
        cy.get('.color-icon:visible').first().click();

        //Filling up input with value #bb123e
        cy.get("input[spellcheck='false']").clear().type('#bb123e');

        //closing modal clicking Sidebar Link
        cy.get('#SidebarStyles').click();

        //saving account settings
        cy.get('#saveSetting').click();

        //access to theme settings one more time
        cy.get('#themeTitle').click();

        //access to custom settings one more time
        cy.get('#customThemes').click();

        //opening LinkAndButtons section again in order to verify change
        cy.get('#LinkAndButtonsStyles').click();

        //verifying configuration change was performed correctly
        cy.get('.color-icon').should('have.css', 'background-color', 'rgb(187, 18, 62)');
    });
});
