// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../../fixtures/timeouts';

export function loginAndVisitChannel(user, channelUrl) {
    cy.apiLogin(user);
    cy.visit(channelUrl);
    cy.get('#postListContent', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
    cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
}
