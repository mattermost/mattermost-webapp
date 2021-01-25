// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @system_console

import * as TIMEOUTS from '../../../../fixtures/timeouts';

describe('Compliance Export', () => {
    before(() => {
        cy.apiRequireLicenseForFeature('Compliance');
        cy.apiUpdateConfig({
            MessageExportSettings: {
                DownloadExportResults: true,
            },
        });
    });

    it('MM-T3435 - Download Compliance Export Files - CSV Format', () => {
        // # Go to compliance page and enable export
        gotoCompliancePage();
        enableComplianceExport();

        // # Navigate to a team and post an attachment
        gotoTeamAndPostImage();

        // # Goto compliance page and start export
        gotoCompliancePage();
        exportCompliance();

        // # Get the download link
        cy.get('@firstRow').findByText('Download').parents('a').should('exist').then((fileAttachment) => {
            const fileURL = fileAttachment.attr('href');

            // # Download the file
            downloadAttachmentAndVerifyItsProperties(fileURL);
        });
    });

    it('MM-T3438 - Download Compliance Export Files when 0 messages exported', () => {
        // # Go to compliance page and enable export
        gotoCompliancePage();
        enableComplianceExport();

        // # Navigate to a team and post an attachment
        gotoTeamAndPostImage();

        // # Goto compliance page and start export
        gotoCompliancePage();
        exportCompliance();

        // # Get the download link
        cy.get('@firstRow').findByText('Download').parents('a').should('exist').then((fileAttachment) => {
            const fileURL = fileAttachment.attr('href');

            // # Download the File
            downloadAttachmentAndVerifyItsProperties(fileURL);

            // # Export compliance again
            exportCompliance();

            // # Download link should not exist this time
            cy.get('.job-table__table').
                find('tbody > tr:eq(0)').
                findByText('Download').should('not.exist');
        });
    });

    it('MM-T3439 - Download Compliance Export Files - S3 Bucket Storage', () => {
        // # Goto file storage settings Page
        cy.visitAndWait('/admin_console/environment/file_storage');
        cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'File Storage');

        // # Get AWS credentials
        const AWS_S3_BUCKET = Cypress.env('AWS_S3_BUCKET');
        const AWS_ACCESS_KEY_ID = Cypress.env('AWS_ACCESS_KEY_ID');
        const AWS_SECRET_ACCESS_KEY = Cypress.env('AWS_SECRET_ACCESS_KEY');

        // # Config AWS settings
        cy.findByTestId('FileSettings.DriverNamedropdown').select('amazons3');
        cy.findByTestId('FileSettings.AmazonS3Bucketinput').type(AWS_S3_BUCKET);
        cy.findByTestId('FileSettings.AmazonS3AccessKeyIdinput').type(AWS_ACCESS_KEY_ID);
        cy.findByTestId('FileSettings.AmazonS3SecretAccessKeyinput').type(AWS_SECRET_ACCESS_KEY);

        // # Save file storage settings
        cy.findByTestId('saveSetting').click();

        waitUntilConfigSave();

        // # Goto compliance page and enable export
        gotoCompliancePage();
        enableComplianceExport();

        // # Navigate to a team and post an attachment
        gotoTeamAndPostImage();

        // # Goto compliance page and start export
        gotoCompliancePage();
        exportCompliance();

        // # Get the download link
        cy.get('@firstRow').findByText('Download').parents('a').should('exist').then((fileAttachment) => {
            const fileURL = fileAttachment.attr('href');

            // # Download the file
            downloadAttachmentAndVerifyItsProperties(fileURL);
        });
    });
});

function enableComplianceExport() {
    // # Enable compliance export
    cy.findByTestId('enableComplianceExporttrue').click();

    // # Change export format to CSV
    cy.findByTestId('exportFormatdropdown').select('csv');

    // # Save settings
    cy.findByTestId('saveSetting').click();

    waitUntilConfigSave();
}

function gotoCompliancePage() {
    cy.visitAndWait('/admin_console/compliance/export');
    cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').invoke('text').should('include', 'Compliance Export');
}

function gotoTeamAndPostImage() {
    // # Get user teams
    cy.apiGetTeamsForUser().then(({teams}) => {
        const team = teams[0];
        cy.visitAndWait(`/${team.name}/channels/town-square`);
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

    // # Small wait to ensure new row is added
    cy.wait(TIMEOUTS.HALF_SEC);

    // # Get the first row
    cy.get('.job-table__table').
        find('tbody > tr').
        eq(0).
        as('firstRow');

    // # Wait until export is finished
    cy.waitUntil(() => {
        return cy.get('@firstRow').find('td:eq(1)').then((el) => {
            return el[0].innerText.trim() === 'Success';
        });
    }, {
        timeout: TIMEOUTS.FIVE_MIN,
        interval: TIMEOUTS.ONE_SEC,
        errorMsg: 'Compliance export did not finish in time',
    });
}

function downloadAttachmentAndVerifyItsProperties(fileURL) {
    cy.request(fileURL).then((response) => {
        // * Verify the download
        expect(response.status).to.equal(200);

        // * Confirm it's a zip file
        expect(response.headers['content-type']).to.equal('application/zip');
    });
}

// # Wait's until the Saving text becomes Save
const waitUntilConfigSave = () => {
    cy.waitUntil(() => cy.get('#saveSetting').then((el) => {
        return el[0].innerText === 'Save';
    }));
};
