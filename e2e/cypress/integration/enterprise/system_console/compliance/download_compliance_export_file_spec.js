// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @system_console

// /// <reference types="cypress-downloadfile"/>

const path = require('path');

const ExportFormatActiance = 'Actiance XML';
let targetDownload;
let fileURL;
let pwd;

describe('Compliance Export', () => {
    let newTeam;
    let newUser;
    let newChannel;
    let adminUser;

    before(() => {
        cy.exec('PWD').then((result) => {
            pwd = result.stdout;
            targetDownload = path.join(pwd, 'Downloads');
        });

        cy.apiRequireLicenseForFeature('Compliance');

        cy.apiUpdateConfig({
            MessageExportSettings: {
                ExportFormat: 'csv',
                DownloadExportResults: true,
            },
        });

        cy.apiInitSetup().then(({team, user, channel}) => {
            newTeam = team;
            newUser = user;
            newChannel = channel;
        });
    });

    beforeEach(() => {
        cy.apiAdminLogin().then(({user}) => {
            adminUser = user;
        });
    });

    afterEach(() => {
        deleteExportFolder();
    });

    it('MM-T1172 - Compliance Export - Deleted file is indicated in CSV File Export', () => {
        // # Go to compliance page and enable export
        cy.gotoCompliancePage();
        cy.enableComplianceExport();

        // # Navigate to a team and post an attachment
        cy.gotoTeamAndPostImage();

        // # Go to compliance page and start export
        cy.gotoCompliancePage();
        cy.exportCompliance();

        // # Deleting last post
        cy.deleteLastPost();

        // # Go to compliance page and start export
        cy.gotoCompliancePage();
        cy.exportCompliance();

        // # Download and extract export zip file
        downloadAndUnzipExportFile();

        // * Verifying if export file contains delete
        cy.readFile(`${targetDownload}/posts.csv`).should('exist').and('have.string', 'deleted attachment');
    });

    it('MM-T1173 - Compliance Export - Deleted file is indicated in Actiance XML File Export', () => {
        // # Go to compliance page and enable export
        cy.gotoCompliancePage();
        cy.enableComplianceExport(ExportFormatActiance);

        // # Navigate to a team and post an attachment
        cy.gotoTeamAndPostImage();

        // # Go to compliance page and start export
        cy.gotoCompliancePage();
        cy.exportCompliance();

        cy.deleteLastPost();

        // # Go to compliance page and start export
        cy.gotoCompliancePage();
        cy.exportCompliance();

        // # Download and extract export zip file
        downloadAndUnzipExportFile();

        // * Verifying if export file contains deleted image
        getXMLFile().then((result) => {
            cy.readFile(result.stdout).should('exist').and('have.string', 'delete file uploaded-image-400x400.jpg');
        });

        // * Verifying if image has been downloaded
        cy.exec(`find ${targetDownload} -name 'image-400x400.jpg'`).then((result) => {
            expect(result.stdout !== null).to.be.true;
        });
    });

    it('MM-T1176 - Compliance export should include updated post after editing', () => {
        // # Go to compliance page and enable export
        cy.gotoCompliancePage();
        cy.enableComplianceExport();

        // # Navigate to a team and post a Message
        cy.gotoTeamAndPostMessage();

        // # Go to compliance page and start export
        cy.gotoCompliancePage();
        cy.exportCompliance();

        // # Edit previous post
        cy.editPost('Hello');

        // # Go to compliance page and start export
        cy.gotoCompliancePage();
        cy.exportCompliance();

        // # Download and extract exported zip file
        downloadAndUnzipExportFile();

        // * Verifying if export file contains edited text
        cy.exec(`find ${targetDownload} -name '*.xml'`).then((result) => {
            cy.readFile(result.stdout).should('exist').and('have.string', '<Content>Hello</Content>');
        });
    });

    it('MM-T3305 - Verify Deactivated users are displayed properly in Compliance Exports', () => {
        // # Post message by Admin
        cy.postMessageAs({
            sender: adminUser,
            message: `@${newUser.username} : Admin 1`,
            channelId: newChannel.id,
        });

        cy.visit(`/${newTeam.name}/channels/${newChannel.id}`);

        // # Deactivate the newly created user
        cy.apiDeactivateUser(newUser.id);

        // # Go to compliance page and enable export
        cy.gotoCompliancePage();
        cy.enableComplianceExport(ExportFormatActiance);
        cy.exportCompliance();

        // # Download and extract exported zip file
        downloadAndUnzipExportFile();

        // * Verifying if export file contains deactivated user info
        getXMLFile().then((result) => {
            cy.readFile(result.stdout).should('exist').
                and('have.string', `<LoginName>${newUser.username}@sample.mattermost.com</LoginName>`);
        });

        deleteExportFolder();

        // # Post message by Admin
        cy.postMessageAs({
            sender: adminUser,
            message: `@${newUser.username} : Admin2`,
            channelId: newChannel.id,
        });

        // # Go to compliance page and start export
        cy.gotoCompliancePage();
        cy.exportCompliance();

        // # Download and extract exported zip file
        downloadAndUnzipExportFile();

        // * Verifying export file should not contain deactivated user name
        getXMLFile().then((result) => {
            cy.readFile(result.stdout).should('exist').
                and('not.have.string', `<LoginName>${newUser.username}@sample.mattermost.com</LoginName>`);
        });

        deleteExportFolder();

        // # Re-activate the user
        cy.apiActivateUser(newUser.id);

        // # Post message by Admin
        cy.postMessageAs({
            sender: adminUser,
            message: `@${newUser.username} : Admin3`,
            channelId: newChannel.id,
        });

        // # Go to compliance page and start export
        cy.gotoCompliancePage();
        cy.exportCompliance();

        // # Download and extract exported zip file
        downloadAndUnzipExportFile();

        // * Verifying if export file contains deactivated user name
        getXMLFile().then((result) => {
            cy.readFile(result.stdout).should('exist').
                and('have.string', `<LoginName>${newUser.username}@sample.mattermost.com</LoginName>`);
        });
    });
});

const getXMLFile = () => {
    return cy.exec(`find ${targetDownload} -name '*.xml'`);
};

function deleteExportFolder() {
    // # Delete export folder
    cy.exec(`rm -rf ${targetDownload}`);
}

function downloadAndUnzipExportFile() {
    // # Get the download link
    cy.get('@firstRow').findByText('Download').parents('a').should('exist').then((fileAttachment) => {
        // # Getting export file url
        fileURL = fileAttachment.attr('href');
        const zipFilePath = path.join(targetDownload, 'export.zip');

        // # Downloading zip file
        cy.request({url: fileURL, encoding: 'binary'}).then((response) => {
            expect(response.status).to.equal(200);
            cy.writeFile(zipFilePath, response.body, 'binary');
        });

        // # Unzipping exported file
        cy.exec(`unzip ${zipFilePath} -d ${targetDownload}`);
        cy.exec(`find ${targetDownload}/export -name '*.zip' | xargs unzip -d ${targetDownload}`);
    });
}
