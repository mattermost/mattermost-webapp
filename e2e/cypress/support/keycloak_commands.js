// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../fixtures/timeouts';

const {
    keycloakBaseUrl,
    keycloakAppName,
} = Cypress.env();

const baseUrl = `${keycloakBaseUrl}/auth/admin/realms/${keycloakAppName}`;
const loginUrl = `${keycloakBaseUrl}/auth/realms/master/protocol/openid-connect/token`;

function buildProfile(user) {
    return {
        firstName: user.firstname,
        lastName: user.lastname,
        email: user.email,
        username: user.username,
        enabled: true,
    };
}

/**
* keycloakGetAccessTokenAPI is a task wrapped as command with post-verification
* that an Access Token is successfully retrieved
*/
Cypress.Commands.add('keycloakGetAccessTokenAPI', () => {
    cy.task('keycloakRequest', {
        baseUrl: loginUrl,
        path: '',
        method: 'post',
        headers: {'Content-type': 'application/x-www-form-urlencoded'},
        data: 'grant_type=password&username=mmuser&password=mostest&client_id=admin-cli',
    }).then((response) => {
        expect(response.status).to.equal(200);
        const token = response.data.access_token;
        return cy.wrap(token);
    });
});

/**
* keycloakCreateUserAPI is a task wrapped as command with post-verification
* that a user is successfully created in keycloak
* @param {String} token - a valid access token
* @param {object} user - a user object to create
*/
Cypress.Commands.add('keycloakCreateUserAPI', (token, user = {}) => {
    const profile = buildProfile(user);
    cy.task('keycloakRequest', {
        baseUrl,
        path: 'users',
        method: 'post',
        data: profile,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    }).then((response) => {
        expect(response.status).to.equal(201);
    });
});

Cypress.Commands.add('keycloakResetPasswordAPI', (token, userId, password) => {
    cy.task('keycloakRequest', {
        baseUrl,
        path: `users/${userId}/reset-password`,
        method: 'put',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        data: {type: 'password', temporary: false, value: password},
    }).then((response) => {
        if (response.status === 200 && response.data.length > 0) {
            return response.data[0].id;
        }
        return null;
    });
});

Cypress.Commands.add('keycloakGetUsersAPI', (token, filter) => {
    cy.task('keycloakRequest', {
        baseUrl,
        path: `users?${filter}`,
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    }).then((response) => {
        return response.data;
    });
});

Cypress.Commands.add('keycloakGetUserAPI', (token, email) => {
    cy.task('keycloakRequest', {
        baseUrl,
        path: 'users?email=' + email,
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    }).then((response) => {
        if (response.status === 200 && response.data.length > 0) {
            return response.data[0].id;
        }
        return null;
    });
});

Cypress.Commands.add('keycloakDeleteUserAPI', (accessToken, userId) => {
    cy.task('keycloakRequest', {
        baseUrl,
        path: `users/${userId}`,
        method: 'delete',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    }).then((response) => {
        expect(response.status).to.equal(204);
        expect(response.data).is.empty;
    });
});

Cypress.Commands.add('keycloakSuspendUserAPI', (token, userId) => {
    cy.keycloakGetAccessTokenAPI(token).then((accessToken) => {
        cy.task('keycloakRequest', {
            baseUrl,
            path: 'users/' + userId,
            method: 'put',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            data: {enabled: false},
        }).then((response) => {
            expect(response.status).to.equal(204);
            expect(response.data).is.empty;
        });
    });
});

Cypress.Commands.add('keycloakUnsuspendUserAPI', (token, userId) => {
    cy.keycloakGetAccessTokenAPI(token).then((accessToken) => {
        cy.task('keycloakRequest', {
            baseUrl,
            path: 'users/' + userId,
            method: 'put',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            data: {enabled: true},
        }).then((response) => {
            expect(response.status).to.equal(204);
            expect(response.data).is.empty;
        });
    });
});

Cypress.Commands.add('keycloakUpdateUserAPI', (token, userId, data) => {
    cy.keycloakGetAccessTokenAPI(token).then((accessToken) => {
        cy.task('keycloakRequest', {
            baseUrl,
            path: 'users/' + userId,
            method: 'put',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            data,
        }).then((response) => {
            expect(response.status).to.equal(204);
            expect(response.data).is.empty;
        });
    });
});

Cypress.Commands.add('keycloakDeleteSession', (token, userId) => {
    cy.keycloakGetAccessTokenAPI(token).then((accessToken) => {
        cy.task('keycloakRequest', {
            baseUrl,
            path: `users/${userId}/sessions`,
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.data);
            if (response.data.length > 0) {
                const sessionId = response.data[0].id;
                cy.task('keycloakRequest', {
                    baseUrl,
                    path: `sessions/${sessionId}`,
                    method: 'delete',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }).then((delResponse) => {
                    expect(delResponse.status).to.equal(204);
                    expect(delResponse.data).is.empty;

                    // Ensure we clear out these specific cookies
                    ['JSESSIONID'].forEach((cookie) => {
                        cy.clearCookie(cookie);
                    });
                });
            }
        });
    });
});

Cypress.Commands.add('keycloakResetUsers', (users) => {
    cy.keycloakGetAccessTokenAPI().then((accessToken) => {
        Object.values(users).forEach((_user) => {
            cy.keycloakGetUsersAPI(accessToken, `email=${_user.email}`).then((existingUsers) => {
                if(existingUsers.length > 0){
                    cy.keycloakDeleteUserAPI(accessToken, existingUsers[0].id);
                }
            }).then(() => {
                cy.keycloakCreateUser(accessToken, _user).then((_id) => {
                    _user.keycloakId = _id;
                });    
            });
        });
    });
});

Cypress.Commands.add('keycloakCreateUser', (accessToken, user) => {
    cy.keycloakCreateUserAPI(accessToken, user).then(() => {
        cy.keycloakGetUserAPI(accessToken, user.email).then((newId) => {
            cy.keycloakResetPasswordAPI(accessToken, newId, user.password).then(() => {
                cy.keycloakDeleteSession(accessToken, newId).then(() => {
                    return newId;
                });
            });
        });
    });
});

Cypress.Commands.add('keycloakSuspendUser', (token, userId) => {
    const data = {enabled: false};
    cy.keycloakUpdateUserAPI(token, userId, data);
});

Cypress.Commands.add('keycloakUnsuspendUser', (token, userId) => {
    const data = {enabled: true};
    cy.keycloakUpdateUserAPI(token, userId, data);
});

Cypress.Commands.add('checkKeycloakLoginPage', () => {
    cy.findByText('Username or email', {timeout: TIMEOUTS.ONE_SEC}).should('be.visible');
    cy.findByText('Password').should('be.visible');
    cy.findAllByText('Log In').should('be.visible');
});

Cypress.Commands.add('doKeycloakLogin', (user) => {
    cy.checkKeycloakLoginPage();
    cy.findByText('Username or email').type(user.email);
    cy.findByText('Password').type(user.password);
    cy.findAllByText('Log In').last().click();
});

Cypress.Commands.add('verifyKeycloakLoginFailed', () => {
    cy.findAllByText('Account is disabled, contact your administrator.').should('be.visible');
});
