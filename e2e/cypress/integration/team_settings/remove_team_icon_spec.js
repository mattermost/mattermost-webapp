// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @team_settings

function openTeamSettingsDialog() {
    // validating the side bar is visible
    cy.get('#sidebarHeaderDropdownButton').should('be.visible');

    // clicking on the side bar
    cy.get('#sidebarHeaderDropdownButton').click();

    // Team settings button must be visible
    cy.get('#teamSettings').should('be.visible').and('contain', 'Team Settings');

    //click on the Team settings button
    cy.get('#teamSettings').click();

    // verify the team settings dialog is open
    cy.get('#teamSettingsModalLabel').should('be.visible').and('contain', 'Team Settings');

    // verify the edit icon is visible
    cy.get('#team_iconEdit').should('be.visible');

    // clicking on edit button
    cy.get('#team_iconEdit').click();
}

describe('Teams Settings', () => {
    let testTeam;

    before(() => {
        // # Update config
        cy.apiUpdateConfig({EmailSettings: {RequireEmailVerification: false}});

        cy.apiInitSetup().then(({team}) => {
            testTeam = team;

            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('MM-T391 Remove team icon', () => {
        // function to open the team settings dialog
        openTeamSettingsDialog();

        // verify the settings picture button is visible to click
        cy.findByTestId('inputSettingPictureButton').should('be.visible').click();

        // before uploading the picture the save button must be disabled
        cy.findByTestId('saveSettingPicture').should('be.disabled');

        // # Upload a file on center view
        cy.findByTestId('uploadPicture').attachFile('mattermost-icon.png');

        // after uploading the picture the save button must be disabled
        cy.findByTestId('saveSettingPicture').should('not.be.disabled').click();

        // close the team settings dialog
        cy.get('#teamSettingsModalLabel > .close').click();

        cy.get(`#${testTeam.name}TeamButton`).within(() => {
            cy.findByTestId('teamIconImage').should('be.visible');
            cy.findByTestId('teamIconInitial').should('not.exist');
        });

        // function to open the team settings dialog
        openTeamSettingsDialog();

        // click on 'X' icon to remove the image
        cy.findByTestId('removeSettingPicture').should('be.visible').click();

        // click on the cancel button
        cy.findByTestId('cancelSettingPicture').should('be.visible').click();

        // close the team settings dialog
        cy.get('#teamSettingsModalLabel > .close').click();

        // verify the team icon image is visible and initial team holder is not visible
        cy.get(`#${testTeam.name}TeamButton`).within(() => {
            cy.findByTestId('teamIconImage').should('be.visible');
            cy.findByTestId('teamIconInitial').should('not.exist');
        });

        // function to open the team settings dialog
        openTeamSettingsDialog();

        // click on 'X' icon to remove the image
        cy.findByTestId('removeSettingPicture').should('be.visible').click();

        // click on the save picture button
        cy.findByTestId('saveSettingPicture').click();

        // close the team settings dialog
        cy.get('#teamSettingsModalLabel > .close').click();

        // after removing the team icon initial team holder is visible but not team icon holder
        cy.get(`#${testTeam.name}TeamButton`).within(() => {
            cy.findByTestId('teamIconImage').should('not.exist');
            cy.findByTestId('teamIconInitial').should('be.visible');
        });
    });
});
