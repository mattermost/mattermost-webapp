// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../fixtures/timeouts';

Cypress.Commands.add('uiGoToDataRetentionPage', () => {
    cy.visit('/admin_console/compliance/data_retention_settings');
    cy.get('.DataRetentionSettings .admin-console__header', {timeout: TIMEOUTS.TWO_MIN}).should('be.visible').invoke('text').should('include', 'Data Retention Policy');
});
