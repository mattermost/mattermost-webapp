// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// **************************************************************

/* eslint max-nested-callbacks: ["error", 4] */

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

describe('AS14318 Theme Colors - Color Picker', () => {
    before(() => {
        // 1. Set default theme preference
        cy.apiSaveThemePreference();
    });

    after(() => {
        // * Revert to default theme preference
        cy.apiSaveThemePreference();
    });

    it('Theme Display should render in min setting view', () => {
        // 1. Go to Account Settings with "user-1"
        cy.toAccountSettingsModal('user-1');

        // * Check that the Display tab is loaded
        cy.get('#displayButton').should('be.visible');

        // 2. Click the Display tab
        cy.get('#displayButton').click();

        // * Check that it changed into the Display section
        cy.get('#displaySettingsTitle').should('be.visible').should('contain', 'Display Settings');

        // * Check the min setting view for each element that is present and contains the expected values
        cy.minDisplaySettings();
    });

    describe('Custom - Sidebar Styles input change', () => {
        before(() => {
            // 1. Go to Theme > Custom > Sidebar Styles
            cy.customColors(0, 'Sidebar Styles');
        });

        after(() => {
            // Save Sidebar Text color change and close the Account settings modal
            cy.get('#saveSetting').click();
            cy.get('#accountSettingsHeader > .close').click();
        });

        testCases.forEach((testCase) => {
            it(`should change ${testCase.name} custom color`, () => {
                // 2. Click input color button
                cy.get('.input-group-addon').eq(testCase.key).click();

                // 3. Click on color bar to change color
                cy.get(testCase.inputTarget).click();

                // * Check that icon color change
                cy.get('.color-icon').eq(testCase.key).should('have.css', testCase.inputColor[0], testCase.inputColor[1]);

                // * Check that theme colors for text sharing is updated
                cy.get('#pasteBox').scrollIntoView().should('contain', testCase.content);
            });
        });

        it('should observe color change in Account Settings modal before saving', () => {
            // * Check Sidebar BG color change
            cy.get('.settings-links').should('have.css', 'background-color', 'rgb(20, 191, 188)');

            // * Check Sidebar Text color change
            cy.get('#generalButton').should('have.css', 'color', 'rgba(129, 65, 65, 0.6)');

            // * Check Sidebar Header BG color change
            cy.get('#accountSettingsHeader').should('have.css', 'background', 'rgb(17, 171, 168) none repeat scroll 0% 0% / auto padding-box border-box');

            // * Check Sidebar Header Text color change
            cy.get('#accountSettingsModalLabel').should('have.css', 'color', 'rgb(129, 65, 65)');
        });
    });

    describe('Custom - Sidebar styles target output change', () => {
        it('should take effect each custom color in Channel View', () => {
            // * Check Sidebar Header Text color change after saving
            cy.get('#accountSettingsModalLabel').should('have.css', 'color', 'rgb(129, 65, 65)');

            // * Check Sidebar Unread Text
            cy.get('.sidebar-item.unread-title').should('have.css', 'color', 'rgb(129, 65, 65)');

            // * Check Sidebar Text Active Color
            cy.get('#displayButton').should('have.css', 'color', 'rgb(129, 65, 65)');

            // * Check Mention Jewel BG color
            cy.get('#unreadIndicatorBottom').should('have.css', 'background-color', 'rgb(129, 65, 65)');

            // * Check Mention Jewel Text color
            cy.get('#unreadIndicatorBottom').should('have.css', 'color', 'rgb(65, 92, 129)');

            // 1. Set user status to online
            cy.userStatus(0);

            // * Check Online Indicator color
            cy.get('.online--icon').should('have.css', 'fill', 'rgb(65, 129, 113)');

            // 2. Set user status to away
            cy.userStatus(1);

            // * Check Away Indicator color
            cy.get('.away--icon').should('have.css', 'fill', 'rgb(129, 106, 65)');

            // 3. Set user status to do not disturb
            cy.userStatus(2);

            // * Check Do Not Disturb Indicator color
            cy.get('.dnd--icon').should('have.css', 'fill', 'rgb(129, 65, 65)');

            // 4. Revert user status to online
            cy.userStatus(0);
        });
    });
});
