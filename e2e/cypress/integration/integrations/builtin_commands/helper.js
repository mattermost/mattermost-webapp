// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../../fixtures/timeouts';

export function loginAndVisitChannel(user, channelUrl, options = null) {
    cy.apiLogin(user);
    if (options) {
        cy.visit(channelUrl, options);
    } else {
        cy.visit(channelUrl);
    }
    cy.get('#postListContent', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
    cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
}

export function verifyEphemeralMessage(message) {
    // # Checking if we got the ephemeral message with the selection we made
    cy.wait(TIMEOUTS.HALF_SEC).getLastPostId().then((botLastPostId) => {
        cy.get(`#post_${botLastPostId}`).within(() => {
            // * Check if Bot message only visible to you
            cy.findByText('(Only visible to you)').should('exist');

            // * Check if we got ephemeral message of our selection
            cy.findByText(message).should('exist');
        });
    });
}
