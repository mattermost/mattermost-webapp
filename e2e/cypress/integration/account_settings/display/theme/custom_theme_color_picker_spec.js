// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('AS14318 Theme Colors - Color Picker', () => {
    beforeEach(() => {
        //Login and navigating to settings
        cy.apiLogin('user-1');
        cy.toAccountSettingsModal(null, true);
        cy.get('#displayButton').click();
        cy.get('#themeTitle').click();
        cy.get('#customThemes').click();
    });

    after(() => {
        cy.apiSaveThemePreference();
    });

    it('Should be able to use color picker input and change Sidebar theme color', () => {
        cy.get('#sidebarStyles').click();

        // # Click the Sidebar BG setting
        cy.get('#sidebarBg-squareColorIcon').click();

        //Filling up input with value #bb123e
        cy.get('#sidebarBg-ChromePickerModal').within(() => {
            cy.get('input').clear().type('#bb123e').type('{enter}');
        });

        //access to theme settings one more time
        cy.get('#themeTitle').click();

        //access to custom settings one more time
        cy.get('#customThemes').click();

        //opening Sidebar section again in order to verify change
        cy.get('#sidebarStyles').click();

        //verifying configuration change was performed correctly
        cy.get('#sidebarBg-squareColorIconValue').should('have.css', 'background-color', 'rgb(187, 18, 62)');
    });

    it('Should be able to use color picker input and change Center Channel Styles', () => {
        cy.get('#centerChannelStyles').click();

        // # Click the Sidebar BG setting
        cy.get('#centerChannelBg-squareColorIcon').click();

        //Filling up input with value #bb123e
        cy.get('#centerChannelBg-ChromePickerModal').within(() => {
            cy.get('input').clear().type('#ff8800').type('{enter}');
        });

        //access to theme settings one more time
        cy.get('#themeTitle').click();

        //access to custom settings one more time
        cy.get('#centerChannelStyles').click();

        //verifying configuration change was performed correctly
        cy.get('#centerChannelBg-squareColorIconValue').should('have.css', 'background-color', 'rgb(255, 136, 0)');
    });

    it('Should be able to use color picker input and change Link and Button Styles', () => {
        cy.get('#linkAndButtonsStyles').click();

        // # Click the Sidebar BG setting
        cy.get('#linkColor-squareColorIcon').click();

        //Filling up input with value #bb123e
        cy.get('#linkColor-ChromePickerModal').within(() => {
            cy.get('input').clear().type('#ffe577').type('{enter}');
        });

        //access to theme settings one more time
        cy.get('#themeTitle').click();

        //access to custom settings one more time
        cy.get('#linkAndButtonsStyles').click();

        //verifying configuration change was performed correctly
        cy.get('#linkColor-squareColorIconValue').should('have.css', 'background-color', 'rgb(255, 229, 119)');
    });
});
