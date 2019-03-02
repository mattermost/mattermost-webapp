// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// **************************************************************

describe('Account Settings > Sidebar > Theme Colors > Color Picker', () => {
    before(() => {
        // 1. Go to Account Settings with "user-1"
        cy.toAccountSettingsModal('user-1');
    });

    it('should render min setting view', () => {
        // * Check that the Display tab is loaded
        cy.get('#displayButton').should('be.visible');

        // 2. Click the Display tab
        cy.get('#displayButton').click();

        // * Check that it changed into the Display section
        // cy.get('#displaySettingsTitle').should('be.visible').should('contain', 'Display Settings');

        // * Check the min setting view for each element that is present and contains the expected values
        // cy.minDisplaySettings();
    });

    // it('should change Sidebar BG color and verify color change', () => {
    //     // 1. Selecting Theme Edit, Custom Theme, and Sidebar Styles dropdown
    //     cy.customColors(0, 'Sidebar Styles');

    //     // 2. Click Sidebar BG
    //     cy.get('.input-group-addon').eq(0).click();

    //     // 3. Click on color bar to change color
    //     cy.get('.hue-horizontal').click();

    //     // 4. Click outside of color modal to remove it from view
    //     cy.get('#displaySettingsTitle').click();

    //     // * Check Sidebar BG color icon change
    //     cy.get('.color-icon').eq(0).should('have.css', 'background-color', 'rgb(20, 191, 188)');

    //     // * Check Sidebar BG color change
    //     cy.get('.settings-links').should('have.css', 'background-color', 'rgb(20, 191, 188)');

    //     // 5. Save Sidebar BG color change
    //     cy.get('#saveSetting').click();

    //     // * Check Sidebar BG color change after saving
    //     cy.get('.settings-links').should('have.css', 'background-color', 'rgb(20, 191, 188)');
    // });

    // it('should change Sidebar Text color and verify color change', () => {
    //     // 1. Selecting Theme Edit, Custom Theme, and Sidebar Styles dropdown
    //     cy.customColors(0, 'Sidebar Styles');

    //     // 2. Click Sidebar Text
    //     cy.get('.input-group-addon').eq(1).click();

    //     // 3. Click in color window to change color
    //     cy.get('.saturation-black').click();

    //     // 4. Click outside of color modal to remove it from view
    //     cy.get('#displaySettingsTitle').click();

    //     // * Check Sidebar Text icon color change
    //     cy.get('.color-icon').eq(1).should('have.css', 'background-color', 'rgb(129, 65, 65)');

    //     // * Check Sidebar Text color change
    //     cy.get('#generalButton').should('have.css', 'color', 'rgba(129, 65, 65, 0.6)');

    //     // 5. Save Sidebar Text  color change
    //     cy.get('#saveSetting').click();

    //     // * Check Sidebar Text color change after saving
    //     cy.get('#generalButton').should('have.css', 'color', 'rgba(129, 65, 65, 0.6)');
    // });

    // it('should change Sidebar Header BG color and verify color change', () => {
    //     // 1. Selecting Theme Edit, Custom Theme, and Sidebar Styles dropdown
    //     cy.customColors(0, 'Sidebar Styles');

    //     // 2. Click Sidebar Header BG
    //     cy.get('.input-group-addon').eq(2).click();

    //     // 3. Click on color bar to change color
    //     cy.get('.hue-horizontal').click();

    //     // 4. Click outside of color modal to remove it from view
    //     cy.get('#displaySettingsTitle').click();

    //     // * Check Sidebar Header BG icon color change
    //     cy.get('.color-icon').eq(2).should('have.css', 'background-color', 'rgb(17, 171, 168)');

    //     // * Check Sidebar Header BG color change
    //     cy.get('#accountSettingsHeader').should('have.css', 'background', 'rgb(17, 171, 168) none repeat scroll 0% 0% / auto padding-box border-box');

    //     // 5. Save Sidebar Header BG color change
    //     cy.get('#saveSetting').click();

    //     // * Check Sidebar Header BG color change after saving
    //     cy.get('#accountSettingsHeader').should('have.css', 'background', 'rgb(17, 171, 168) none repeat scroll 0% 0% / auto padding-box border-box');
    // });

    // it('should change Sidebar Header Text color and verify color change', () => {
    //     // 1. Selecting Theme Edit, Custom Theme, and Sidebar Styles dropdown
    //     cy.customColors(0, 'Sidebar Styles');

    //     // 2. Click Sidebar Header Text
    //     cy.get('.input-group-addon').eq(3).click();

    //     // 3. Cick on color window to change color
    //     cy.get('.saturation-black').click();

    //     // 4. Click outside of color modal to remove it from view
    //     cy.get('#displaySettingsTitle').click();

    //     // * Check Sidebar Header Text icon color change
    //     cy.get('.color-icon').eq(3).should('have.css', 'background-color', 'rgb(129, 65, 65)');

    //     // * Check Sidebar Header Text color change
    //     cy.get('#accountSettingsTitle').should('have.css', 'color', 'rgb(129, 65, 65)');

    //     // 5. Save Sidebar Header Text color change
    //     cy.get('#saveSetting').click();

    //     // * Check Sidebar Header Text color change after saving
    //     cy.get('#accountSettingsTitle').should('have.css', 'color', 'rgb(129, 65, 65)');
    // });

    // it('should change Sidebar Unread Text color and verify color change', () => {
    //     // 1. Selecting Theme Edit, Custom Theme, and Sidebar Styles dropdown
    //     cy.customColors(0, 'Sidebar Styles');

    //     // 2. Click Sidebar Unread Text
    //     cy.get('.input-group-addon').eq(4).click();

    //     // 3. Click on color window to change color
    //     cy.get('.saturation-black').click();

    //     // 4. Click outside of color modal to remove it from view
    //     cy.get('#displaySettingsTitle').click();

    //     // * Check Sidebar Header Text icon color change
    //     cy.get('.color-icon').eq(4).should('have.css', 'background-color', 'rgb(129, 65, 65)');

    //     // 5. Save Sidebar Unread Text color change
    //     cy.get('#saveSetting').click();

    // // 6. Exit user settings
    // cy.get('#accountSettingsHeader > .close').click();

    //     // * Check Sidebar Unread Text
    //     cy.get('.sidebar-item.unread-title').should('have.css', 'color', 'rgb(129, 65, 65)');

    // // 7. Open sidebar dropdown
    // cy.get('#sidebarHeaderDropdownButton').click();

    // // 8. Select Account Settings
    // cy.get('#accountSettings').click();

    // // 9. Click the Display tab
    // cy.get('#displayButton').click();
    // });

    // it('should change Sidebar Text Hover BG color and verify color change', () => {
    //     // 1. Selecting Theme Edit, Custom Theme, and Sidebar Styles dropdown
    //     cy.customColors(0, 'Sidebar Styles');

    //     // 2. Click Sidebar Text Hover BG
    //     cy.get('.input-group-addon').eq(5).click()

    //     // 3. Click on color bar to change color
    //     cy.get('.hue-horizontal').click();

    //     // 4. Click outside of color modal to remove it from view
    //     cy.get('#displaySettingsTitle').click();

    //     // * Check Sidebar Text Hover BG color icon change
    //     cy.get('.color-icon').eq(5).should('have.css', 'background-color', 'rgb(69, 191, 191)');

    //     // 5. Save Sidebar Text Hover BG color change
    //     cy.get('#saveSetting').click();

    //     // * CSS hover is not currently implemented for cypress, unable to find workaroun. mouseenter/mouseover does not work

    //     // // 8. Exit user settings
    //     // cy.get('#accountSettingsHeader > .close').click();

    //     // * Check Sidebar Text Hover BG color change
    //     // cy.get('#sidebarItem_autem-2').trigger('mouseover, { force: true }');
    //     // cy.get('.sidebar-item').should('have.css', 'background-color', 'rgb(69, 191, 191)');
    // });

    it('should change Sidebar Text Active Border color and verify color change', () => {
        // 1. Selecting Theme Edit, Custom Theme, and Sidebar Styles dropdown
        cy.customColors(0, 'Sidebar Styles');

        // 2. Click Sidebar Text Active Border
        cy.get('.input-group-addon').eq(6).click();

        // 3. Click on color window to change color
       // cy.get('.saturation-black').click();

        // 4. Click outside of color modal to remove it from view
        cy.get('#displaySettingsTitle').click();

        // * Check Sidebar Text Active Border icon color change
        cy.get('.color-icon').eq(6).should('have.css', 'background-color', 'rgb(65, 92, 129)');

        // 5. Save Sidebar Text Active Border color change
        cy.get('#saveSetting').click();

        // 6. Exit user settings
        cy.get('#accountSettingsHeader > .close').click();

        // unsure how to identify this, need to research
        
        // // * Check Sidebar Text Active Border
        // cy.get('#sidebarItem_town-square.sidebar-item::before(129, 65, 72)');

        // 7. Open sidebar dropdown
        cy.get('#sidebarHeaderDropdownButton').click();

        // 8. Select Account Settings
        cy.get('#accountSettings').click();

        // 9. Click the Display tab
        cy.get('#displayButton').click();
    });

    // it('should revert any color changes made', () => {
    //     // 1. Click "Edit" to the right of Theme
    //    cy.get('#themeEdit').click();

    //     // 2. Select Standard Theme
    //     cy.get('#standardThemes').click();

    //     // 3. Select the Mattermost Theme
    //     cy.get('.col-xs-6.col-sm-3.premade-themes').first().click();

    //     // 4. Select the Save button to save changes
    //     cy.get('#saveSetting').click();
    // });
});
