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
    // * Verify the side bar is visible
    cy.get('#sidebarHeaderDropdownButton').should('be.visible');

    // # Click on the side bar
    cy.get('#sidebarHeaderDropdownButton').click();

    // * Verify team settings button is visible
    cy.get('#teamSettings').should('be.visible').and('contain', 'Team Settings');

    // # Click on the Team settings button
    cy.get('#teamSettings').click();

    // * Verify the team settings dialog is open
    cy.get('#teamSettingsModalLabel').should('be.visible').and('contain', 'Team Settings');

    // * Verify the edit icon is visible
    cy.get('#team_iconEdit').should('be.visible');

    // # Click on edit button
    cy.get('#team_iconEdit').click();
}

describe('Teams Settings', () => {
    let testTeam;

    before(() => {
        // # Update config
        cy.apiUpdateConfig({EmailSettings: {RequireEmailVerification: false}});

        // # Reset teams and channels
        cy.utilResetTeamsAndChannels();

        cy.apiInitSetup().then(({team}) => {
            testTeam = team;

            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('TS14632 Remove Team Icon', () => {
        // # Open the team settings dialog
        openTeamSettingsDialog();

        // # Click the settings picture button
        cy.findByTestId('inputSettingPictureButton').should('be.visible').click();

        // * Verify save button is disabled before uploading the picture 
        cy.findByTestId('saveSettingPicture').should('be.disabled');

        // # Upload a file on center view
        cy.findByTestId('uploadPicture').attachFile('mattermost-icon.png');

        // * Verify save button is not disabled after uploading the picture
        cy.findByTestId('saveSettingPicture').should('not.be.disabled').click();

        // # Close the team settings dialog
        cy.get('#teamSettingsModalLabel > .close').click();

        cy.get(`#${testTeam.name}TeamButton`).within(() => {
            cy.findByTestId('teamIconImage').should('be.visible');
            cy.findByTestId('teamIconInitial').should('not.exist');
        });

        // # Open the team settings dialog
        openTeamSettingsDialog();

        // # Click on 'X' icon to remove the image
        cy.findByTestId('removeSettingPicture').should('be.visible').click();

        // # Click on the cancel button
        cy.findByTestId('cancelSettingPicture').should('be.visible').click();

        // # Close the team settings dialog
        cy.get('#teamSettingsModalLabel > .close').click();

        // * Verify the team icon image is visible and team icon intial is not visible
        cy.get(`#${testTeam.name}TeamButton`).within(() => {
            cy.findByTestId('teamIconImage').should('be.visible');
            cy.findByTestId('teamIconInitial').should('not.exist');
        });

        // # Open the team settings dialog
        openTeamSettingsDialog();

        // # Click on 'X' icon to remove the image
        cy.findByTestId('removeSettingPicture').should('be.visible').click();

        // # Click on the save picture button
        cy.findByTestId('saveSettingPicture').click();

        // # Close the team settings dialog
        cy.get('#teamSettingsModalLabel > .close').click();

        // * Verify the team icon image is not visible and team icon intial is visible after removing the icon
        cy.get(`#${testTeam.name}TeamButton`).within(() => {
            cy.findByTestId('teamIconImage').should('not.exist');
            cy.findByTestId('teamIconInitial').should('be.visible');
        });
    });
});
