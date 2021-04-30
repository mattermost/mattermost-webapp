// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../fixtures/timeouts';

Cypress.Commands.add('uiGoToDataRetentionPage', () => {
    cy.visit('/admin_console/compliance/data_retention_settings');
    cy.get('.DataRetentionSettings .admin-console__header', {timeout: TIMEOUTS.TWO_MIN}).should('be.visible').invoke('text').should('include', 'Data Retention Policies');
});

Cypress.Commands.add('uiClickCreatePolicy', () => {
    cy.uiGetButton('Add policy').click();
    cy.get('.DataRetentionSettings .admin-console__header', {timeout: TIMEOUTS.TWO_MIN}).should('be.visible').invoke('text').should('include', 'Custom Retention Policy');
});

Cypress.Commands.add('uiFillOutCustomPolicyFields', (name, durationDropdown, durationText = '') => {
    cy.uiGetTextbox('Policy name').clear().type(name);
    cy.get('.CustomPolicy__fields #DropdownInput_message_retention').should('be.visible').click();
    cy.get(`.message_retention__menu .message_retention__option span.option_${durationDropdown}`).should('be.visible').click();
    if (durationText) {
        cy.get('.CustomPolicy__fields input#message_retention_input').clear().type(durationText);
    }
});

Cypress.Commands.add('uiAddTeamsToCustomPolicy', (teamNames) => {
    cy.uiGetButton('Add teams').click();
    teamNames.forEach(teamName => {
        cy.findByRole('textbox', {name: 'Search and add teams'}).clear().type(teamName);
        cy.get('.team-info-block').then((el) => {
            el.click();
        });
    });
    cy.uiGetButton('Add').click();
});

Cypress.Commands.add('uiAddChannelsToCustomPolicy', (channelNames) => {
    cy.uiGetButton('Add channels').click();
    channelNames.forEach(channelName => {
        cy.findByRole('textbox', {name: 'Search and add channels'}).clear().type(channelName);
        // Wait for channel to load
        cy.wait(1000);
        cy.get('.channel-info-block').then((el) => {
            el.click();
        });
    });
    cy.uiGetButton('Add').click();
});

Cypress.Commands.add('uiAddRandomTeamToCustomPolicy', () => {
    cy.uiGetButton('Add teams').click();
    cy.get('.team-info-block').first().then((el) => {
        el.click();
    });
    cy.uiGetButton('Add').click();
});

Cypress.Commands.add('uiAddRandomChannelToCustomPolicy', () => {
    cy.uiGetButton('Add channels').click();
    cy.get('.channel-info-block').first().then((el) => {
        el.click();
    });
    cy.uiGetButton('Add').click();
});

Cypress.Commands.add('uiVerifyCustomPolicyRow', (policyId, description, duration, appliedTo) => {
    cy.get(`#customDescription-${policyId}`).should('include.text', description);
    cy.get(`#customDuration-${policyId}`).should('include.text', duration);
    cy.get(`#customAppliedTo-${policyId}`).should('include.text', appliedTo);
});

Cypress.Commands.add('uiClickEditCustomPolicyRow', (policyId) => {
    cy.get(`#customWrapper-${policyId}`).trigger('mouseover').click();
    cy.findByRole('button', {name: /edit/i}).should('be.visible').click();
});

Cypress.Commands.add('uiVerifyPolicyResponse', (body, teamCount, channelCount, duration, displayName) => {
    assert.isNotNull(body);
    assert.isNotNull(body.id);
    expect(body.team_count).to.equal(teamCount);
    expect(body.channel_count).to.equal(channelCount);
    expect(body.post_duration).to.equal(duration);
    expect(body.display_name).to.equal(displayName);
});
