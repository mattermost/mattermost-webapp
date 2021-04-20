// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @system_console

import * as TIMEOUTS from '../../../../../fixtures/timeouts';
import {gotoGlobalPolicy, editGlobalPolicyMessageRetention, editGlobalPolicyFileRetention} from '../helpers';


describe('Data Retention', () => {
    before(() => {
        cy.apiRequireLicenseForFeature('DataRetention');

        // Enable the feature flag for the granular retention policies
        cy.apiUpdateConfig({
            FeatureFlags: {
                CustomDataRetentionEnabled: true,
            },
        });
    });

    it('MM-T4019 - Global Data Retention policy', () => {
        cy.uiGoToDataRetentionPage();

        gotoGlobalPolicy();
        
        editGlobalPolicyMessageRetention('365', '1 year');

        gotoGlobalPolicy();
        
        editGlobalPolicyMessageRetention('700', '700 days');

        gotoGlobalPolicy();

        editGlobalPolicyFileRetention('365', '1 year');

        gotoGlobalPolicy();

        editGlobalPolicyFileRetention('600', '600 days');
    });

    // it('MM-T1177_2 - Compliance export should include updated posts after editing multiple times, exporting multiple times', () => {
    //     // # Go to compliance page and enable export
    //     cy.uiGoToCompliancePage();
    //     cy.uiEnableComplianceExport();
    //     cy.uiExportCompliance();

    //     // # Navigate to a team and post a Message
    //     gotoTeamAndPostMessage();

    //     // # Edit last post
    //     editLastPost('This is Edit One');

    //     // # Post a Message
    //     cy.postMessage('This is Edit Two');

    //     // # Go to compliance page and export
    //     cy.uiGoToCompliancePage();
    //     cy.uiExportCompliance();

    //     // * 3 messages should be exported
    //     verifyExportedMessagesCount('3');
    // });

    // it('MM-T1177_3 - Compliance export should include updated posts after editing multiple times, exporting multiple times', () => {
    //     // # Go to compliance page and enable export
    //     cy.uiGoToCompliancePage();
    //     cy.uiEnableComplianceExport();
    //     cy.uiExportCompliance();

    //     // # Navigate to a team and post a message
    //     gotoTeamAndPostMessage();

    //     // # Go to compliance page and export
    //     cy.uiGoToCompliancePage();
    //     cy.uiExportCompliance();

    //     // # Editing previously exported post
    //     goToUserTeam();
    //     editLastPost('This is Edit Three');

    //     // # Go to compliance page and export
    //     cy.uiGoToCompliancePage();
    //     cy.uiExportCompliance();

    //     // * 2 messages should be exported
    //     verifyExportedMessagesCount('2');
    // });

    // it('MM-T1177_4 - Compliance export should include updated posts after editing multiple times, exporting multiple times', () => {
    //     // # Go to compliance page and enable export
    //     cy.uiGoToCompliancePage();
    //     cy.uiEnableComplianceExport();
    //     cy.uiExportCompliance();

    //     // # Navigate to a team and post a Message
    //     gotoTeamAndPostMessage();

    //     // # Go to compliance page and export
    //     cy.uiGoToCompliancePage();
    //     cy.uiExportCompliance();

    //     // # Editing previously exported post
    //     goToUserTeam();
    //     editLastPost('This is Edit Three');

    //     // # Post new message
    //     cy.postMessage('This is the post');

    //     // # Go to compliance page and export
    //     cy.uiGoToCompliancePage();
    //     cy.uiExportCompliance();

    //     // * 3 messages should be exported
    //     verifyExportedMessagesCount('3');
    // });

    // it('MM-T1177_5 - Compliance export should include updated posts after editing multiple times, exporting multiple times', () => {
    //     // # Go to compliance page and enable export
    //     cy.uiGoToCompliancePage();
    //     cy.uiEnableComplianceExport();
    //     cy.uiExportCompliance();

    //     // # Navigate to a team and post a message
    //     gotoTeamAndPostMessage();

    //     // # Editing previously exported post
    //     editLastPost('This is Edit Four');
    //     editLastPost('This is Edit Five');

    //     // # Go to compliance page and export
    //     cy.uiGoToCompliancePage();
    //     cy.uiExportCompliance();

    //     // * 3 messages should be exported
    //     verifyExportedMessagesCount('3');
    // });
});

function goToUserTeam() {
    cy.apiGetTeamsForUser().then(({teams}) => {
        const team = teams[0];
        cy.visit(`/${team.name}/channels/town-square`);
        cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
    });
}
