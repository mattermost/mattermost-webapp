// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../fixtures/timeouts';

Cypress.Commands.add('uiGoToDataRetentionPage', () => {
    cy.visit('/admin_console/compliance/data_retention_settings');
    cy.get('.DataRetentionSettings .admin-console__header', {timeout: TIMEOUTS.TWO_MIN}).should('be.visible').invoke('text').should('include', 'Data Retention Policy');
});

Cypress.Commands.add('uiClickCreatePolicy', () => {
    cy.uiGetButton('Add policy').click();
    cy.get('.DataRetentionSettings .admin-console__header', {timeout: TIMEOUTS.TWO_MIN}).should('be.visible').invoke('text').should('include', 'Custom Retention Policy');
});

Cypress.Commands.add('uiFillOutCustomPolicyFields', (name, durationDropdown, durationText) => {
    cy.uiGetTextbox('Policy name').clear().type(name);
    cy.get('.CustomPolicy__fields #DropdownInput_message_retention').should('be.visible').click();
    cy.get(`.message_retention__menu .message_retention__option span.option_${durationDropdown}`).should('be.visible').click();
    cy.get('.CustomPolicy__fields input#message_retention_input').clear().type(durationText);
});

Cypress.Commands.add('uiAddTeamsToCustomPolicy', (teamNames) => {
    cy.uiGetButton('Add teams').click();
    teamNames.forEach(teamName => {
        cy.get('#selectItems input').clear().type(teamName);
        cy.get('.team-info-block').then((el) => {
            el.click();
        });
    });
    cy.uiGetButton('Add').click();
});

Cypress.Commands.add('uiAddChannelsToCustomPolicy', (channelNames) => {
    cy.uiGetButton('Add channels').click();
    channelNames.forEach(channelName => {
        cy.get('#selectItems input').clear().type(channelName);
        // Wait for channel to load
        cy.wait(1000);
        cy.get('.channel-info-block').then((el) => {
            el.click();
        });
    });
    cy.uiGetButton('Add').click();
});
