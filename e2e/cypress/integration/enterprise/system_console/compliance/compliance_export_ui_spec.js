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
                ExportFormat: 'csv',
                DownloadExportResults: true,
            },
        });
    });

    it('MM-T3435 - Download Compliance Export Files - CSV Format', () => {
        // # Go to compliance page and enable export
        cy.gotoCompliancePage();
        cy.enableComplianceExport();
        cy.exportCompliance();

        // # Navigate to a team and post an attachment
        cy.gotoTeamAndPostImage();

        // # Goto compliance page and start export
        cy.gotoCompliancePage();

        cy.exportCompliance();

        // # Get the download link
        cy.get('@firstRow').findByText('Download').parents('a').should('exist').then((fileAttachment) => {
            const fileURL = fileAttachment.attr('href');

            // # Download the file
            cy.downloadAttachmentAndVerifyItsProperties(fileURL);
        });
    });

    it('MM-T3438 - Download Compliance Export Files when 0 messages exported', () => {
        // # Go to compliance page and enable export
        cy.gotoCompliancePage();
        cy.enableComplianceExport();
        cy.exportCompliance();

        // # Navigate to a team and post an attachment
        cy.gotoTeamAndPostImage();

        // # Goto compliance page and start export
        cy.gotoCompliancePage();
        cy.exportCompliance();

        // # Get the download link
        cy.get('@firstRow').findByText('Download').parents('a').should('exist').then((fileAttachment) => {
            const fileURL = fileAttachment.attr('href');

            // # Download the File
            cy.downloadAttachmentAndVerifyItsProperties(fileURL);

            // # Export compliance again
            cy.exportCompliance();

            // # Download link should not exist this time
            cy.get('.job-table__table').
                find('tbody > tr:eq(0)').
                findByText('Download').should('not.exist');
        });
    });

    it('MM-T3439 - Download Compliance Export Files - S3 Bucket Storage', () => {
        // # Goto file storage settings Page
        cy.visit('/admin_console/environment/file_storage');
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

        // # Save file storage settingss
        cy.findByTestId('saveSetting').click();

        waitUntilConfigSave();

        // # Goto compliance page and enable export
        cy.gotoCompliancePage();
        cy.enableComplianceExport();
        cy.exportCompliance();

        // # Navigate to a team and post an attachment
        cy.gotoTeamAndPostImage();

        // # Goto compliance page and start export
        cy.gotoCompliancePage();
        cy.exportCompliance();

        // # Get the download link
        cy.get('@firstRow').findByText('Download').parents('a').should('exist').then((fileAttachment) => {
            const fileURL = fileAttachment.attr('href');

            // # Download the file
            cy.downloadAttachmentAndVerifyItsProperties(fileURL);
        });
    });

    it('MM-T1168 - Compliance Export - Run Now, entry appears in job table', () => {
        // # Go to compliance page and enable export
        cy.gotoCompliancePage();
        cy.enableComplianceExport();
        cy.exportCompliance();

        // # Navigate to a team and post an attachment
        cy.gotoTeamAndPostImage();

        // # Go to compliance page and start export
        cy.gotoCompliancePage();
        cy.exportCompliance();

        // * Verifying table header
        cy.get('@firstheader').find('th:eq(1)').should('have.text', 'Status');
        cy.get('@firstheader').find('th:eq(2)').should('have.text', 'Files');
        cy.get('@firstheader').find('th:eq(3)').should('have.text', 'Finish Time');
        cy.get('@firstheader').find('th:eq(4)').should('have.text', 'Run Time');
        cy.get('@firstheader').find('th:eq(5)').should('have.text', 'Details');

        // * Verifying first row (last run job) data
        cy.get('@firstRow').find('td:eq(1)').should('have.text', 'Success');
        cy.get('@firstRow').find('td:eq(2)').should('have.text', 'Download');
        cy.get('@firstRow').find('td:eq(4)').contains('seconds');
        cy.get('@firstRow').find('td:eq(5)').should('have.text', '1 messages exported.');
    });

    it('MM-T1169_1 - Compliance Export - CSV and Global Relay', () => {
        // # Go to compliance page and enable export
        cy.gotoCompliancePage();
        cy.enableComplianceExport();
        cy.exportCompliance();

        // # Navigate to a team and post an attachment
        cy.gotoTeamAndPostImage();

        // # Post 10 text messages
        for (var i = 1; i < 10; i++) {
            cy.postMessage(`This is the ${i} post`);
        }

        // # Go to compliance page and start export
        cy.gotoCompliancePage();
        cy.exportCompliance();

        // * 10 Messages should be exported
        cy.verifyingExportedMessages('10');
    });

    it('MM-T1165 - Compliance Export - Fields disabled when disabled', () => {
        // # Go to compliance page and disable export
        cy.gotoCompliancePage();
        cy.findByTestId('enableComplianceExportfalse').click();

        // * Verify that exported button is disabled
        cy.findByRole('button', {name: /run compliance export job now/i}).should('be.disabled');
    });

    it('MM-T1167 - Compliance Export job can be canceled', () => {
        // # Go to compliance page and enable export
        cy.gotoCompliancePage();
        cy.enableComplianceExport();

        // # Click the export job button
        cy.findByRole('button', {name: /run compliance export job now/i}).click();

        // # Small wait to ensure new row is add
        cy.wait(TIMEOUTS.THREE_SEC);

        // # Get the first row
        cy.get('.job-table__table').find('tbody > tr').eq(0).as('firstRow');

        // # Wait until export is finished
        cy.waitUntil(() => {
            return cy.get('@firstRow').find('td:eq(1)').then((el) => {
                return el[0].innerText.trim() === 'Pending';
            });
        },
        {
            timeout: TIMEOUTS.FIVE_MIN,
            interval: TIMEOUTS.ONE_SEC,
            errorMsg: 'Compliance export did not finish in time',
        });

        // # Click X button
        cy.get('@firstRow').find('td:eq(0)').click();

        // * Canceled text should be shown in the first row of the table
        cy.get('@firstRow').find('td:eq(1)').should('have.text', 'Canceled');
    });
});

// # Wait's until the Saving text becomes Save
const waitUntilConfigSave = () => {
    cy.waitUntil(() => cy.get('#saveSetting').then((el) => {
        return el[0].innerText === 'Save';
    }));
};
