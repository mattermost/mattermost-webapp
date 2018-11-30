// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import users from '../fixtures/users.json';

// ***********************************************************
// Read more: https://on.cypress.io/custom-commands
// ***********************************************************

Cypress.Commands.add('login', (username, {otherUsername, otherPassword, otherURL} = {}) => {
    const user = users[username];
    const usernameParam = user && user.username ? user.username : otherUsername;
    const passwordParam = user && user.password ? user.password : otherPassword;
    const urlParam = otherURL ? `${otherURL}/api/v4/users/login` : '/api/v4/users/login';

    cy.request({
        url: urlParam,
        method: 'POST',
        body: {login_id: usernameParam, password: passwordParam},
    });
});

Cypress.Commands.add('toAccountSettingsModal', (username, isLoggedInAlready = false, {otherUsername, otherPassword, otherURL} = {}) => {
    if (!isLoggedInAlready) {
        cy.login('user-1', {otherUsername, otherPassword, otherURL});
        cy.visit('/');
    }

    cy.get('#channel_view').should('be.visible');
    cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
    cy.get('#accountSettings').should('be.visible').click();
    cy.get('#accountSettingsModal').should('be.visible');
});
