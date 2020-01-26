// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../../../fixtures/timeouts';

const testCases = [
    {key: 0, name: 'Sidebar BG', backgroundColor: 'rgb(20, 191, 188)', themeId: 'sidebarBg', value: '#14bfbc'},
    {key: 1, name: 'Sidebar Text', backgroundColor: 'rgb(129, 65, 65)', themeId: 'sidebarText', value: '#814141'},
    {key: 2, name: 'Sidebar Header BG', backgroundColor: 'rgb(17, 171, 168)', themeId: 'sidebarHeaderBg', value: '#11aba8'},
    {key: 3, name: 'Sidebar Header Text', backgroundColor: 'rgb(129, 65, 65)', themeId: 'sidebarHeaderTextColor', value: '#814141'},
    {key: 4, name: 'Sidebar Unread Text', backgroundColor: 'rgb(129, 65, 65)', themeId: 'sidebarUnreadText', value: '#814141'},
    {key: 5, name: 'Sidebar Text Hover BG', backgroundColor: 'rgb(69, 191, 191)', themeId: 'sidebarTextHoverBg', value: '#45bfbf'},
    {key: 6, name: 'Sidebar Text Active Border', backgroundColor: 'rgb(65, 92, 129)', themeId: 'sidebarTextActiveBorder', value: '#415c81'},
    {key: 7, name: 'Sidebar Text Active Color', backgroundColor: 'rgb(129, 65, 65)', themeId: 'sidebarTextActiveColor', value: '#814141'},
    {key: 8, name: 'Online Indicator', backgroundColor: 'rgb(65, 129, 113)', themeId: 'onlineIndicator', value: '#418171'},
    {key: 9, name: 'Away Indicator', backgroundColor: 'rgb(129, 106, 65)', themeId: 'awayIndicator', value: '#816a41'},
    {key: 10, name: 'Do Not Disturb Indicator', backgroundColor: 'rgb(129, 65, 65)', themeId: 'dndIndicator', value: '#814141'},
    {key: 11, name: 'Mention Jewel BG', backgroundColor: 'rgb(129, 65, 65)', themeId: 'mentionBg', value: '#814141'},
    {key: 12, name: 'Mention Jewel Text', backgroundColor: 'rgb(65, 92, 129)', themeId: 'mentionColor', value: '#415c81'},
];

describe('AS14318 Theme Colors - Custom Sidebar Styles input change', () => {
    before(() => {
        // # Set default theme preference
        cy.apiLogin('user-1');
        cy.apiSaveThemePreference();

        // # Go to Theme > Custom > Sidebar Styles
        toThemeDisplaySettings();
        openSidebarStyles();
    });

    after(() => {
        cy.apiSaveThemePreference();
    });

    testCases.forEach((testCase) => {
        it(`should change ${testCase.name} custom color`, () => {
            // # Click input color button
            cy.get('.input-group-addon').eq(testCase.key).scrollIntoView().click({force: true});

            // # Enter hex value
            cy.get('.color-popover').scrollIntoView().within(() => {
                cy.get('input').clear({force: true}).invoke('val', testCase.value).wait(TIMEOUTS.TINY).type(' {backspace}{enter}', {force: true});
            });

            // * Check that icon color change
            cy.get('.color-icon').eq(testCase.key).should('have.css', 'background-color', testCase.backgroundColor);

            // * Check that theme colors for text sharing is updated
            cy.get('#pasteBox').scrollIntoView().should('contain', `"${testCase.themeId}":"${testCase.value}"`);
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

        cy.get('#saveSetting').click({force: true});
        cy.get('#accountSettingsHeader > .close').click();
    });

    it('should take effect each custom color in Channel View', () => {
        // * Check Sidebar Unread Text
        cy.get('.sidebar-item.unread-title').should('have.css', 'color', 'rgb(129, 65, 65)');

        // * Check Mention Jewel BG color
        cy.get('#unreadIndicatorBottom').should('have.css', 'background-color', 'rgb(129, 65, 65)');

        // * Check Mention Jewel Text color
        cy.get('#unreadIndicatorBottom').should('have.css', 'color', 'rgb(65, 92, 129)');

        // # Set user status to online
        cy.userStatus(0);

        // * Check Online Indicator color
        cy.get('.online--icon').should('have.css', 'fill', 'rgb(65, 129, 113)');

        // # Set user status to away
        cy.userStatus(1);

        // * Check Away Indicator color
        cy.get('.away--icon').should('have.css', 'fill', 'rgb(129, 106, 65)');

        // # Set user status to do not disturb
        cy.userStatus(2);

        // * Check Do Not Disturb Indicator color
        cy.get('.dnd--icon').should('have.css', 'fill', 'rgb(129, 65, 65)');

        // # Revert user status to online
        cy.userStatus(0);
    });
});

function toThemeDisplaySettings() {
    // # Go to account settings modal
    cy.toAccountSettingsModal(null, true);

    // * Check that the Display tab is loaded, then click on it
    cy.get('#displayButton').should('be.visible').click();
}

// Open sidebar styles at Account Settings > Display > Theme
function openSidebarStyles() {
    // # Click "Edit" on Theme
    cy.get('#themeEdit').scrollIntoView().click();

    // # Select Custom Theme
    cy.get('#customThemes').click();

    // # Expand sidebar styles
    cy.get('#sidebarStyles').click({force: true});
}
