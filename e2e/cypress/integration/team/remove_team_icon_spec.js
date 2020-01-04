// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

let team;

function openTeamSettingsDialog() {
    // validating the side bar is visible
    cy.get('#sidebarHeaderDropdownButton').should('be.visible');

    // clicking on the side bar
    cy.get('#sidebarHeaderDropdownButton').click();

    // Team settings button must be visible
    cy.get('#teamSettings').should('be.visible').should('contain', 'Team Settings');

    //click on the Team settings button
    cy.get('#teamSettings').click();

    // verify the team settings dialog is open
    cy.get('#teamSettingsModalLabel').should('be.visible').should('contain', 'Team Settings');

    // verify the edit icon is visible
    cy.get('#team_iconEdit').should('be.visible');

    // clicking on edit button
    cy.get('#team_iconEdit').click();
}

describe('Teams Suite', () => {
    before(() => {
        cy.apiUpdateConfig({EmailSettings: {RequireEmailVerification: false}});

        // # Login as new user
        cy.loginAsNewUser().then(() => {
            // # Create new team and visit its URL
            cy.apiCreateTeam('test-team', 'Test Team').then((response) => {
                team = response.body;
                cy.visit(`/${team.name}`);
            });
        });
    });

    it('TS14632 Remove Team Icon', () => {
        // function to open the team settings dialog
        openTeamSettingsDialog();

        // verify the settings picture button is visible to click
        cy.get('[data-testid="inputSettingPictureButton"]').should('be.visible').click();

        // # Upload a file on center view
        cy.fileUpload('[data-testid="uploadPicture"]', 'mattermost-icon.png');

        // after uploading the picture the save button must be disabled
        cy.get('[data-testid="saveSettingPicture"]').should('not.be.disabled').click();

        // close the team settings dialog
        cy.get('#teamSettingsModalLabel > .close').click();

        cy.get(`#${team.name}TeamButton`).within(() => {
            cy.get('[data-testid="teamIconImage"]').should('be.visible');
            cy.get('[data-testid="teamIconInitial"]').should('not.exist');
        });

        // function to open the team settings dialog
        openTeamSettingsDialog();

        // click on 'X' icon to remove the image
        cy.get('[data-testid="removeSettingPicture"]').should('be.visible').click();

        // click on the cancel button
        cy.get('[data-testid="cancelSettingPicture"]').should('be.visible').click();

        // close the team settings dialog
        cy.get('#teamSettingsModalLabel > .close').click();

        // verify the team icon image is visible and initial team holder is not visible
        cy.get(`#${team.name}TeamButton`).within(() => {
            cy.get('[data-testid="teamIconImage"]').should('be.visible');
            cy.get('[data-testid="teamIconInitial"]').should('not.exist');
        });

        // function to open the team settings dialog
        openTeamSettingsDialog();

        // click on 'X' icon to remove the image
        cy.get('[data-testid="removeSettingPicture"]').should('be.visible').click();

        // click on the save picture button
        cy.get('[data-testid="saveSettingPicture"]').click();

        // close the team settings dialog
        cy.get('#teamSettingsModalLabel > .close').click();

        // after removing the team icon initial team holder is visible but not team icon holder
        cy.get(`#${team.name}TeamButton`).within(() => {
            cy.get('[data-testid="teamIconImage"]').should('not.exist');
            cy.get('[data-testid="teamIconInitial"]').should('be.visible');
        });
    });
});