// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from '../api/types';

import * as TIMEOUTS from '../../fixtures/timeouts';

function uiGoToDataRetentionPage() {
    cy.visit('/admin_console/compliance/data_retention_settings');
    cy.get('.DataRetentionSettings .admin-console__header', {timeout: TIMEOUTS.TWO_MIN}).should('be.visible').invoke('text').should('include', 'Data Retention Policies');
}
Cypress.Commands.add('uiGoToDataRetentionPage', uiGoToDataRetentionPage);

function uiClickCreatePolicy() {
    cy.uiGetButton('Add policy').click();
    cy.get('.DataRetentionSettings .admin-console__header', {timeout: TIMEOUTS.TWO_MIN}).should('be.visible').invoke('text').should('include', 'Custom Retention Policy');
}
Cypress.Commands.add('uiClickCreatePolicy', uiClickCreatePolicy);

function uiFillOutCustomPolicyFields(name: string, durationDropdown: string, durationText = '') {
    // # Type policy name
    cy.uiGetTextbox('Policy name').clear().type(name);

    // # Add message retention values
    cy.get('.CustomPolicy__fields #DropdownInput_message_retention').should('be.visible').click();
    cy.get(`.message_retention__menu .message_retention__option span.option_${durationDropdown}`).should('be.visible').click();
    if (durationText) {
        cy.get('.CustomPolicy__fields input#message_retention_input').clear().type(durationText);
    }
}
Cypress.Commands.add('uiFillOutCustomPolicyFields', uiFillOutCustomPolicyFields);

function uiAddTeamsToCustomPolicy(teamNames: string[]) {
    cy.uiGetButton('Add teams').click();
    teamNames.forEach((teamName) => {
        cy.findByRole('textbox', {name: 'Search and add teams'}).clear().type(teamName);
        cy.get('.team-info-block').then((el) => {
            el.click();
        });
    });
    cy.uiGetButton('Add').click();
}
Cypress.Commands.add('uiAddTeamsToCustomPolicy', uiAddTeamsToCustomPolicy);

function uiAddChannelsToCustomPolicy(channelNames: string[]) {
    cy.uiGetButton('Add channels').click();
    channelNames.forEach((channelName) => {
        cy.findByRole('textbox', {name: 'Search and add channels'}).typeWithForce(channelName);
        cy.wait(TIMEOUTS.ONE_SEC);
        cy.get('.channel-info-block').then((el) => {
            el.click();
        });
    });
    cy.uiGetButton('Add').click();
}
Cypress.Commands.add('uiAddChannelsToCustomPolicy', uiAddChannelsToCustomPolicy);

function uiAddRandomTeamToCustomPolicy(numberOfTeams = 1) {
    cy.uiGetButton('Add teams').click();
    for (let i = 0; i < numberOfTeams; i++) {
        cy.get('.team-info-block').first().then((el) => {
            el.click();
        });
    }
    cy.uiGetButton('Add').click();
}
Cypress.Commands.add('uiAddRandomTeamToCustomPolicy', uiAddRandomTeamToCustomPolicy);

function uiAddRandomChannelToCustomPolicy(numberOfChannels = 1) {
    cy.uiGetButton('Add channels').click();
    for (let i = 0; i < numberOfChannels; i++) {
        cy.get('.channel-info-block').first().then((el) => {
            el.click();
        });
    }
    cy.uiGetButton('Add').click();
}
Cypress.Commands.add('uiAddRandomChannelToCustomPolicy', uiAddRandomChannelToCustomPolicy);

function uiVerifyCustomPolicyRow(policyId: string, description: string, duration: string, appliedTo: string) {
    // * Assert row has correct description
    cy.get(`#customDescription-${policyId}`).should('include.text', description);

    // * Assert row has correct duration
    cy.get(`#customDuration-${policyId}`).should('include.text', duration);

    // * Assert row has correct team/channel counts
    cy.get(`#customAppliedTo-${policyId}`).should('include.text', appliedTo);
}
Cypress.Commands.add('uiVerifyCustomPolicyRow', uiVerifyCustomPolicyRow);

function uiClickEditCustomPolicyRow(policyId: string) {
    cy.get(`#customWrapper-${policyId}`).trigger('mouseover').click();
    cy.findByRole('button', {name: /edit/i}).should('be.visible').click();
}
Cypress.Commands.add('uiClickEditCustomPolicyRow', uiClickEditCustomPolicyRow);

interface PolicyResponseBody {
    id: string;
    team_count: number;
    channel_count: number;
    post_duration: number;
    display_name: string;
}
function uiVerifyPolicyResponse(body: PolicyResponseBody, teamCount: number, channelCount: number, duration: number, displayName: string) {
    // * Assert response body exists
    assert.isNotNull(body);

    // * Assert response body contains an ID
    assert.isNotNull(body.id);

    // * Assert response body team_count matches supplied value
    expect(body.team_count).to.equal(teamCount);

    // * Assert response body channel_count matches supplied value
    expect(body.channel_count).to.equal(channelCount);

    // * Assert response body duration matches supplied value
    expect(body.post_duration).to.equal(duration);

    // * Assert response body display_name matches supplied value
    expect(body.display_name).to.equal(displayName);
}
Cypress.Commands.add('uiVerifyPolicyResponse', uiVerifyPolicyResponse);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Go to Data Retention page
             */
            uiGoToDataRetentionPage(): ChainableT<void>;

            /**
             * Click create policy button
             */
            uiClickCreatePolicy(): ChainableT<void>;

            /**
             * Fill out custom policy form fields
             * @param {string} name - policy name
             * @param {string} durationDropdown - duration dropdown value (days, years, forever)
             * @param {string?} durationText - duration text
             */
            uiFillOutCustomPolicyFields(name: string, durationDropdown: string, durationText: string): ChainableT<void>;

            /**
             * Search and add teams to custom policy
             * @param {string[]} teamNames - array of team names
             */
            uiAddTeamsToCustomPolicy(teamNames: string[]): ChainableT<void>;

            /**
             * Search and add channels to custom policy
             * @param {string[]} channelNames - array of channel names
             */
            uiAddChannelsToCustomPolicy(channelNames: string[]): ChainableT<void>;

            /**
             * Add teams to a custom policy
             * @param {number} numberOfTeams - number of teams to add to the policy
             */
            uiAddRandomTeamToCustomPolicy(numberOfTeams: number): ChainableT<void>;

            /**
             * Add channels to a custom policy
             * @param {number} numberOfChannels - number of teams to add to the policy
             */
            uiAddRandomChannelToCustomPolicy(numberOfChannels: number): ChainableT<void>;

            /**
             * Verify custom policy UI information
             * @param {string} policyId - Custom Policy ID
             * @param {string} description - The name of the policy
             * @param {string} duration - How long messages last in the policy
             * @param {string} appliedTo - Teams and channels the policy apples to
             */
            uiVerifyCustomPolicyRow(policyId: string, description: string, duration: string, appliedTo: string): ChainableT<void>;

            /**
             * Click edit custom policy
             * @param {string} policyId - Custom Policy ID
             */
            uiClickEditCustomPolicyRow(policyId: string): ChainableT<void>;

            /**
             * Verify custom create policy response
             * @param body - Response body
             * @param {number} teamCount - Number of teams the policy applies to
             * @param {number} channelCount - Number of channels the policy applies to
             * @param {number} duration - How long messages last in the policy
             * @param {string} displayName - The name of the policy
             */
            uiVerifyPolicyResponse(body: PolicyResponseBody, teamCount: number, channelCount: number, duration: number, displayName: string): ChainableT<void>;
        }
    }
}
