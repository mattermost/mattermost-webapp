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
import {gotoGlobalPolicy, editGlobalPolicyMessageRetention, editGlobalPolicyFileRetention, clickCreatePolicy} from '../helpers';

describe('Data Retention', () => {
    let testTeam;
    let testChannel;
    let customPolicyId;

    before(() => {
        cy.apiRequireLicenseForFeature('DataRetention');

        // Enable the feature flag for the granular retention policies
        cy.apiUpdateConfig({
            FeatureFlags: {
                CustomDataRetentionEnabled: true,
            },
        });

        cy.apiInitSetup().then(({team, channel}) => {
            testTeam = team;
            testChannel = channel;
        });
    });

    // it('MM-T4019 - Global Data Retention policy', () => {
    //     cy.uiGoToDataRetentionPage();

    //     gotoGlobalPolicy();
        
    //     editGlobalPolicyMessageRetention('365', '1 year');

    //     gotoGlobalPolicy();
        
    //     editGlobalPolicyMessageRetention('700', '700 days');

    //     gotoGlobalPolicy();

    //     editGlobalPolicyFileRetention('365', '1 year');

    //     gotoGlobalPolicy();

    //     editGlobalPolicyFileRetention('600', '600 days');
    // });

    it('MM-T4005 - Create custom policy', () => {
        cy.intercept({
            method: 'POST',
            url: '/api/v4/data_retention/policies'
        }).as('createCustomPolicy');

        cy.uiGoToDataRetentionPage();

        cy.uiClickCreatePolicy();

        cy.uiFillOutCustomPolicyFields('Policy 1', 'days', '60');

        cy.uiAddTeamsToCustomPolicy([testTeam.display_name]);

        cy.uiAddChannelsToCustomPolicy([testChannel.display_name]);

        cy.uiGetButton('Save').click();

        cy.get('#custom_policy_table .DataGrid').should('be.visible');

        cy.wait('@createCustomPolicy').then((interception) => {
            assert.isNotNull(interception.response.body);
            assert.isNotNull(interception.response.body.id);
            customPolicyId = interception.response.body.id;

            cy.get('#custom_policy_table .DataGrid').within(() => {
                cy.get(`#customDescription-${customPolicyId}`).should('include.text', 'Policy 1');
                cy.get(`#customDuration-${customPolicyId}`).should('include.text', '60 days');
                cy.get(`#customAppliedTo-${customPolicyId}`).should('include.text', '1 team, 1 channel');
            });
        });
    });

    it('MM-T4005 - Edit custom policy', () => {
        cy.intercept({
            method: 'POST',
            url: '/api/v4/data_retention/policies'
        }).as('createCustomPolicy');

        cy.uiGoToDataRetentionPage();

        cy.uiClickCreatePolicy();

        cy.uiFillOutCustomPolicyFields('Policy 2', 'years', '2');

        cy.uiGetButton('Add teams').click();
        cy.get('.team-info-block').first().then((el) => {
            el.click();
        });
        cy.uiGetButton('Add').click();

        cy.uiGetButton('Save').click();

        cy.get('#custom_policy_table .DataGrid').should('be.visible');

        cy.wait('@createCustomPolicy').then((interception) => {
            assert.isNotNull(interception.response.body);
            assert.isNotNull(interception.response.body.id);
            let policyId = interception.response.body.id;

            cy.get('#custom_policy_table .DataGrid').within(() => {
                cy.get(`#customDescription-${policyId}`).should('include.text', 'Policy 2');
                cy.get(`#customDuration-${policyId}`).should('include.text', '2 years');
                cy.get(`#customAppliedTo-${policyId}`).should('include.text', '1 team, 0 channels');

                cy.get(`#customWrapper-${policyId}`).trigger('mouseover').click();
                cy.findByRole('button', {name: /edit/i}).should('be.visible').click();
            });
            cy.get('.DataRetentionSettings .admin-console__header', {timeout: TIMEOUTS.TWO_MIN}).should('be.visible').invoke('text').should('include', 'Custom Retention Policy');

            // cy.get('.PolicyTeamsList .DataGrid').within(() => {
                
            // });
            cy.findByRole('link', {name: 'Remove'}).should('exist').click();

            cy.uiGetButton('Add channels').click();
            cy.get('.channel-info-block').first().then((el) => {
                el.click();
            });
            cy.uiGetButton('Add').click();
            cy.uiGetButton('Save').click();

            cy.get('#custom_policy_table .DataGrid').should('be.visible');

            cy.get('#custom_policy_table .DataGrid').within(() => {
                cy.get(`#customDescription-${policyId}`).should('include.text', 'Policy 2');
                cy.get(`#customDuration-${policyId}`).should('include.text', '2 years');
                cy.get(`#customAppliedTo-${policyId}`).should('include.text', '0 teams, 1 channel');
            });
        });
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
