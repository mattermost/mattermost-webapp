// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import users from '../fixtures/users.json';

// ***********************************************************
// Read more: https://on.cypress.io/custom-commands
// ***********************************************************

Cypress.Commands.add('login', (userType, {username, password, url}) => {
    const user = users[userType];
    const usernameParam = user && user.username ? user.username : username;
    const passwordParam = user && user.password ? user.password : password;
    const urlParam = url ? `${url}/api/v4/users/login` : '/api/v4/users/login';

    cy.request({
        url: urlParam,
        method: 'POST',
        body: {login_id: usernameParam, password: passwordParam},
    });
});

