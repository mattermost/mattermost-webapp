// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @system_console

// /// <reference types="cypress-downloadfile"/>

import * as TIMEOUTS from '../../../../fixtures/timeouts';

const path = require('path');

const EXPORT_FORMAT_CSV = 'csv';
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
        deleteExportFolder();
    });

    it('MM-T1172 - Compliance Export - Deleted file is indicated in CSV File Export', () => {
        // # Go to compliance page and enable export
        gotoCompliancePage();
        enableComplianceExport();

        // # Navigate to a team and post an attachment
        gotoTeamAndPostImage();

        // # Go to compliance page and start export
        gotoCompliancePage();
        exportCompliance();

        // # Deleting last post
        deleteLastPost();

        // # Go to compliance page and start export
        gotoCompliancePage();
        exportCompliance();

        // # Download and extract export zip file
        downloadAndUnzipExportFile();

        // * Verifying if export file contains delete
        cy.readFile(`${targetDownload}/posts.csv`).should('exist').and('have.string', 'deleted attachment');
    });

    it('MM-T1173 - Compliance Export - Deleted file is indicated in Actiance XML File Export', () => {
        // # Go to compliance page and enable export
        gotoCompliancePage();
        enableComplianceExport(ExportFormatActiance);

        // # Navigate to a team and post an attachment
        gotoTeamAndPostImage();

        // # Go to compliance page and start export
        gotoCompliancePage();
        exportCompliance();

        deleteLastPost();

        // # Go to compliance page and start export
        gotoCompliancePage();
        exportCompliance();

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
        gotoCompliancePage();
        enableComplianceExport(ExportFormatActiance);

        // # Navigate to a team and post a Message
        gotoTeamAndPostMessage();

        // # Go to compliance page and start export
        gotoCompliancePage();
        exportCompliance();

        // # Edit previous post
        editPost('Hello');

        // # Go to compliance page and start export
        gotoCompliancePage();
        exportCompliance();

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
        gotoCompliancePage();
        enableComplianceExport(ExportFormatActiance);
        exportCompliance();

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
        gotoCompliancePage();
        exportCompliance();

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

        gotoCompliancePage();
        exportCompliance();

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

function editPost(message) {
    cy.apiGetTeamsForUser().then(({teams}) => {
        const team = teams[0];
        cy.visit(`/${team.name}/channels/town-square`);

        cy.getLastPostId().then(() => {
            cy.get('#post_textbox').clear().type('{uparrow}');

            // # Edit post modal should appear
            cy.get('#editPostModal').should('be.visible');

            // # Update the post message and type ENTER
            cy.get('#edit_textbox').invoke('val', '').type(`${message}`).type('{enter}').wait(TIMEOUTS.HALF_SEC);

            cy.get('#editPostModal').should('be.not.visible');
        });
    });
}

function gotoTeamAndPostMessage() {
    // # Get user teams
    cy.apiGetTeamsForUser().then(({teams}) => {
        const team = teams[0];
        cy.visit(`/${team.name}/channels/town-square`);
        cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
        cy.postMessage('Hello This is Testing');
    });
}

function enableComplianceExport(exportFormate = EXPORT_FORMAT_CSV) {
    // # Enable compliance export
    cy.findByTestId('enableComplianceExporttrue').click();

    // # Change export format to CSV
    cy.findByTestId('exportFormatdropdown').select(exportFormate);

    // # Save settings
    cy.findByTestId('saveSetting').click();

    waitUntilConfigSave();
}

function gotoCompliancePage() {
    cy.visit('/admin_console/compliance/export');
    cy.get('.admin-console__header', {timeout: TIMEOUTS.TWO_MIN}).should('be.visible').invoke('text').should('include', 'Compliance Export');
}

function gotoTeamAndPostImage() {
    // # Get user teams
    cy.apiGetTeamsForUser().then(({teams}) => {
        const team = teams[0];
        cy.visit(`/${team.name}/channels/town-square`);
        cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
    });

    // # Remove images from post message footer if exist
    cy.waitUntil(() => cy.get('#postCreateFooter').then((el) => {
        if (el.find('.post-image.normal').length > 0) {
            cy.get('.file-preview__remove > .icon').click();
        }
        return el.find('.post-image.normal').length === 0;
    }));
    const file = {
        filename: 'image-400x400.jpg',
        originalSize: {width: 400, height: 400},
        thumbnailSize: {width: 400, height: 400},
    };
    cy.get('#fileUploadInput').attachFile(file.filename);

    // # Wait until the image is uploaded
    cy.waitUntil(() => cy.get('#postCreateFooter').then((el) => {
        return el.find('.post-image.normal').length > 0;
    }), {
        timeout: TIMEOUTS.FIVE_MIN,
        interval: TIMEOUTS.ONE_SEC,
        errorMsg: 'Unable to upload attachment in time',
    });

    cy.postMessage(`file uploaded-${file.filename}`);
}

function exportCompliance() {
    // # Click the export job button
    cy.contains('button', 'Run Compliance Export Job Now').click();

    // # Small wait to ensure new row is add
    cy.wait(TIMEOUTS.THREE_SEC);

    // # Get the first row
    cy.get('.job-table__table').
        find('tbody > tr').
        eq(0).
        as('firstRow');

    // # Get the first table header
    cy.get('.job-table__table').find('thead > tr').as('firstheader');

    // # Wait until export is finished
    cy.waitUntil(() => {
        return cy.get('@firstRow').find('td:eq(1)').then((el) => {
            return el[0].innerText.trim() === 'Success';
        });
    },
    {
        timeout: TIMEOUTS.FIVE_MIN,
        interval: TIMEOUTS.ONE_SEC,
        errorMsg: 'Compliance export did not finish in time',
    });
}

// # Wait's until the Saving text becomes Save
const waitUntilConfigSave = () => {
    cy.waitUntil(() => cy.get('#saveSetting').then((el) => {
        return el[0].innerText === 'Save';
    }));
};

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
