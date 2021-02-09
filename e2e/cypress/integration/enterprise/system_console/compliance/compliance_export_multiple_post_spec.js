// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @system_console

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

    it('MM-T1177_1 - Compliance export should include updated posts after editing multiple times, exporting multiple times', () => {
        // # Go to compliance page and enable export
        cy.gotoCompliancePage();
        cy.enableComplianceExport();
        cy.exportCompliance();

        // # Navigate to a team and post a Message
        cy.gotoTeamAndPostMessage();

        // Post a Message
        cy.postMessage('this testing');

        // # Edit last post
        cy.editPost();

        // # Go to compliance page and export
        cy.gotoCompliancePage();
        cy.exportCompliance();

        // * 3 messages should be exported
        cy.verifyingExportedMessages('3');
    });

    it('MM-T1177-02 - Compliance export should include updated posts after editing multiple times, exporting multiple times', () => {
        // # Go to compliance page and enable export
        cy.gotoCompliancePage();
        cy.enableComplianceExport();
        cy.exportCompliance();

        // # Navigate to a team and post a Message
        cy.gotoTeamAndPostMessage();

        // # Edit last post
        cy.editPost('This is Edit One');

        // # Post a Message
        cy.postMessage('This is Edit Two');

        // # Go to compliance page and export
        cy.gotoCompliancePage();
        cy.exportCompliance();

        // * 3 messages should be exported
        cy.verifyingExportedMessages('3');
    });

    it('MM-T1177-03 - Compliance export should include updated posts after editing multiple times, exporting multiple times', () => {
        // # Go to compliance page and enable export
        cy.gotoCompliancePage();
        cy.enableComplianceExport();
        cy.exportCompliance();

        // # Navigate to a team and post a Message
        cy.gotoTeamAndPostMessage();

        // # Go to compliance page and export
        cy.gotoCompliancePage();
        cy.exportCompliance();

        // # Editing previously exported post
        cy.gotoTeam();
        cy.editPost('This is Edit Three');

        // # Go to compliance page and export
        cy.gotoCompliancePage();
        cy.exportCompliance();

        // * 2 messages should be exported
        cy.verifyingExportedMessages('2');
    });

    it('MM-T1177-04 - Compliance export should include updated posts after editing multiple times, exporting multiple times', () => {
        // # Go to compliance page and enable export
        cy.gotoCompliancePage();
        cy.enableComplianceExport();
        cy.exportCompliance();

        // # Navigate to a team and post a Message
        cy.gotoTeamAndPostMessage();

        // # Go to compliance page and export
        cy.gotoCompliancePage();
        cy.exportCompliance();

        // # Editing previously exported post
        cy.gotoTeam();
        cy.editPost('This is Edit Three');

        // # Post new Message
        cy.postMessage('This is the post');

        // # Go to compliance page and export
        cy.gotoCompliancePage();
        cy.exportCompliance();

        // * 3 messages should be exported
        cy.verifyingExportedMessages('3');
    });

    it('MM-T1177-05 - Compliance export should include updated posts after editing multiple times, exporting multiple times', () => {
        // # Go to compliance page and enable export
        cy.gotoCompliancePage();
        cy.enableComplianceExport();
        cy.exportCompliance();

        // # Navigate to a team and post a Message
        cy.gotoTeamAndPostMessage();

        // # Editing previously exported post
        cy.editPost('This is Edit Four');
        cy.editPost('This is Edit Five');

        // # Go to compliance page and export
        cy.gotoCompliancePage();
        cy.exportCompliance();

        // * 3 messages should be exported
        cy.verifyingExportedMessages('3');
    });
});
