import * as TIMEOUTS from '../../fixtures/timeouts';

let team;

function openTeamSettingsDialog() {
    // validating the side bar is visible
    cy.get('#sidebarHeaderDropdownButton').should('be.visible')

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
        openTeamSettingsDialog()

        // verify the settings picture button is visible to click
        cy.get('#inputSettingPictureButton').should('be.visible').click();

        // # Upload a file on center view
        cy.fileUpload('#uploadPicture', 'mattermost-icon.png');

        // after uploading the picture the save button must be disabled
        cy.get('#saveSettingPicture').should('not.be.disabled').click();

        // close the team settings dialog 
        cy.get('#teamSettingsModalLabel > .close').click();

        cy.get(`#${team.name}TeamButton`).within(() => {
            cy.get('#teamIconImage').should('be.visible');
            cy.get('#teamIconInitial').should('not.exist');
        });

        // function to open the team settings dialog
        openTeamSettingsDialog()

        // click on 'X' icon to remove the image
        cy.get('#removeSettingPicture').should('be.visible').click();

        // click on the cancel button
        cy.get('#cancelSettingPicture').should('be.visible').click();

        // close the team settings dialog
        cy.get('#teamSettingsModalLabel > .close').click();

        // verify the team icon image is visible and initial team holder is not visible
        cy.get(`#${team.name}TeamButton`).within(() => {
            cy.get('#teamIconImage').should('be.visible');
            cy.get('#teamIconInitial').should('not.exist');
        });

        // function to open the team settings dialog
        openTeamSettingsDialog()

        // click on 'X' icon to remove the image
        cy.get('#removeSettingPicture').should('be.visible').click();

        // click on the save picture button
        cy.get('#saveSettingPicture').click();

        // close the team settings dialog 
        cy.get('#teamSettingsModalLabel > .close').click();

        // after removing the team icon initial team holder is visible but not team icon holder
        cy.get(`#${team.name}TeamButton`).within(() => {
            cy.get('#teamIconImage').should('not.exist');
            cy.get('#teamIconInitial').should('be.visible');
        });

    });
});