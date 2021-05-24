// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import timeouts from '../../fixtures/timeouts';

export function fillCredentialsForUser(user) {
    cy.wait(timeouts.TWO_SEC);
    cy.get('#loginId').should('be.visible').clear().type(user.username).wait(timeouts.ONE_SEC);
    cy.get('#loginPassword').should('be.visible').clear().type(user.password).wait(timeouts.ONE_SEC);
    cy.findByText('Sign in').click().wait(timeouts.ONE_SEC);
}
