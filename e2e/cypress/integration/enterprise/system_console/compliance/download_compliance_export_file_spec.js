// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @system_console @compliance_export

import {
    deleteExportFolder,
    downloadAndUnzipExportFile,
    editLastPost,
    getXMLFile,
    gotoTeamAndPostImage,
} from './helpers';

describe('Compliance Export', () => {
    const ExportFormatActiance = 'Actiance XML';
    const downloadsFolder = Cypress.config('downloadsFolder');

    let newTeam;
    let newUser;
    let newChannel;
    let adminUser;

    before(() => {
        cy.apiRequireLicenseForFeature('Compliance');

        cy.apiUpdateConfig({
            MessageExportSettings: {
                ExportFormat: 'csv',
                DownloadExportResults: true,
            },
        });

        cy.apiCreateCustomAdmin().then(({sysadmin}) => {
            adminUser = sysadmin;
            cy.apiLogin(adminUser);
            cy.apiInitSetup().then(({team, user, channel}) => {
                newTeam = team;
                newUser = user;
                newChannel = channel;
            });
        });
    });

    beforeEach(() => {
        cy.apiLogin(adminUser);
    });

    afterEach(() => {
        deleteExportFolder(downloadsFolder);
    });

    it('MM-T1172 - Compliance Export - Deleted file is indicated in CSV File Export', () => {
        // # Go to compliance page and enable export
        cy.uiGoToCompliancePage();
        cy.uiEnableComplianceExport();

        // # Navigate to a team and post an attachment
        cy.visit(`/${newTeam.name}/channels/town-square`);
        gotoTeamAndPostImage();

        // # Go to compliance page and start export
        cy.uiGoToCompliancePage();
        cy.uiExportCompliance();

        // # Deleting last post
        deleteLastPost();

        // # Go to compliance page and start export
        cy.uiGoToCompliancePage();
        cy.uiExportCompliance();

        // # Download and extract export zip file
        downloadAndUnzipExportFile(downloadsFolder);

        // * Verifying if export file contains delete
        cy.readFile(`${downloadsFolder}/posts.csv`).should('exist').and('have.string', 'deleted attachment');
    });

    it('MM-T1173 - Compliance Export - Deleted file is indicated in Actiance XML File Export', () => {
        // # Go to compliance page and enable export
        cy.uiGoToCompliancePage();
        cy.uiEnableComplianceExport(ExportFormatActiance);

        // # Navigate to a team and post an attachment
        cy.visit(`/${newTeam.name}/channels/town-square`);
        gotoTeamAndPostImage();

        // # Go to compliance page and start export
        cy.uiGoToCompliancePage();
        cy.uiExportCompliance();

        // # Delete last post
        deleteLastPost();

        // # Go to compliance page and start export
        cy.uiGoToCompliancePage();
        cy.uiExportCompliance();

        // # Download and extract exported zip file
        downloadAndUnzipExportFile(downloadsFolder);

        // * Verifying if export file contains deleted image
        getXMLFile(downloadsFolder).then((result) => {
            cy.readFile(result.stdout).should('exist').and('have.string', 'delete file uploaded-image-400x400.jpg');
        });

        // * Verifying if image has been downloaded
        cy.exec(`find ${downloadsFolder} -name 'image-400x400.jpg'`).then((result) => {
            expect(result.stdout !== null).to.be.true;
        });
    });

    it('MM-T1176 - Compliance export should include updated post after editing', () => {
        // # Go to compliance page and enable export
        cy.uiGoToCompliancePage();
        cy.uiEnableComplianceExport(ExportFormatActiance);

        // # Navigate to a team and post a message
        cy.visit(`/${newTeam.name}/channels/town-square`);
        cy.postMessage('Testing');

        // # Go to compliance page and start export
        cy.uiGoToCompliancePage();
        cy.uiExportCompliance();

        // # Visit town-square channel and edit the last post
        cy.visit(`/${newTeam.name}/channels/town-square`);
        editLastPost('Hello');

        // # Go to compliance page and start export
        cy.uiGoToCompliancePage();
        cy.uiExportCompliance();

        // # Download and extract exported zip file
        downloadAndUnzipExportFile(downloadsFolder);

        // * Verifying if export file contains edited text
        cy.exec(`find ${downloadsFolder} -name '*.xml'`).then((result) => {
            cy.readFile(result.stdout).should('exist').and('have.string', '<Content>Hello</Content>');
        });
    });

    it('MM-T3305 - Verify Deactivated users are displayed properly in Compliance Exports', () => {
        // # Post a message by Admin
        cy.postMessageAs({
            sender: adminUser,
            message: `@${newUser.username} : Admin 1`,
            channelId: newChannel.id,
        });

        cy.visit(`/${newTeam.name}/channels/${newChannel.id}`);

        // # Deactivate the newly created user
        cy.apiDeactivateUser(newUser.id);

        // # Go to compliance page and enable export
        cy.uiGoToCompliancePage();
        cy.uiEnableComplianceExport(ExportFormatActiance);
        cy.uiExportCompliance();

        // # Download and extract exported zip file
        downloadAndUnzipExportFile(downloadsFolder);

        // * Verifying if export file contains deactivated user info
        getXMLFile(downloadsFolder).then((result) => {
            cy.readFile(result.stdout).should('exist').
                and('have.string', `<LoginName>${newUser.username}@sample.mattermost.com</LoginName>`);
        });

        deleteExportFolder(downloadsFolder);

        // # Post a message by Admin
        cy.postMessageAs({
            sender: adminUser,
            message: `@${newUser.username} : Admin2`,
            channelId: newChannel.id,
        });

        // # Go to compliance page and start export
        cy.uiGoToCompliancePage();
        cy.uiExportCompliance();

        // # Download and extract exported zip file
        downloadAndUnzipExportFile(downloadsFolder);

        // * Verifying export file should not contain deactivated user name
        getXMLFile(downloadsFolder).then((result) => {
            cy.readFile(result.stdout).should('exist').
                and('not.have.string', `<LoginName>${newUser.username}@sample.mattermost.com</LoginName>`);
        });

        deleteExportFolder(downloadsFolder);

        // # Re-activate the user
        cy.apiActivateUser(newUser.id);

        // # Post a message by Admin
        cy.postMessageAs({
            sender: adminUser,
            message: `@${newUser.username} : Admin3`,
            channelId: newChannel.id,
        });

        // # Go to compliance page and start export
        cy.uiGoToCompliancePage();
        cy.uiExportCompliance();

        // # Download and extract exported zip file
        downloadAndUnzipExportFile(downloadsFolder);

        // * Verifying if export file contains deactivated user name
        getXMLFile(downloadsFolder).then((result) => {
            cy.readFile(result.stdout).should('exist').
                and('have.string', `<LoginName>${newUser.username}@sample.mattermost.com</LoginName>`);
        });
    });
});

function deleteLastPost() {
    cy.apiGetTeamsForUser().then(({teams}) => {
        const team = teams[0];
        cy.visit(`/${team.name}/channels/town-square`);
        cy.getLastPostId().then((lastPostId) => {
            // # Click post dot menu in center.
            cy.clickPostDotMenu(lastPostId);

            // # Scan inside the post menu dropdown
            cy.get(`#CENTER_dropdown_${lastPostId}`).should('exist').within(() => {
                // # Click on the delete post button from the dropdown
                cy.findByText('Delete').should('exist').click();
            });
        });
        cy.get('.a11y__modal.modal-dialog').should('exist').and('be.visible').
            within(() => {
                // # Confirm click on the delete button for the post
                cy.findByText('Delete').should('be.visible').click();
            });
    });
}
