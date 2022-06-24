// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AxiosResponse} from 'axios';

import * as TIMEOUTS from '../fixtures/timeouts';

import {ChainableT} from './api/types';

const {
    keycloakBaseUrl,
    keycloakAppName,
} = Cypress.env();

const baseUrl = `${keycloakBaseUrl}/auth/admin/realms/${keycloakAppName}`;
const loginUrl = `${keycloakBaseUrl}/auth/realms/master/protocol/openid-connect/token`;

function buildProfile(user: {firstname: string; lastname: string; email: string; username: string}) {
    return {
        firstName: user.firstname,
        lastName: user.lastname,
        email: user.email,
        username: user.username,
        enabled: true,
    };
}

function keycloakGetAccessTokenAPI(): ChainableT<string> {
    return cy.task('keycloakRequest', {
        baseUrl: loginUrl,
        path: '',
        method: 'post',
        headers: {'Content-type': 'application/x-www-form-urlencoded'},
        data: 'grant_type=password&username=mmuser&password=mostest&client_id=admin-cli',
    }).then((response: AxiosResponse<{access_token: string}>) => {
        expect(response.status).to.equal(200);
        const token = response.data.access_token;
        return cy.wrap(token);
    });
}
Cypress.Commands.add('keycloakGetAccessTokenAPI', keycloakGetAccessTokenAPI);

function keycloakCreateUserAPI(accessToken: string, user = {}): ChainableT<any> {
    const profile = buildProfile((user as Parameters<typeof buildProfile>[0]));
    return cy.task('keycloakRequest', {
        baseUrl,
        path: 'users',
        method: 'post',
        data: profile,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    }).then((response: AxiosResponse<any>) => {
        expect(response.status).to.equal(201);
    });
}
Cypress.Commands.add('keycloakCreateUserAPI', keycloakCreateUserAPI);

function keycloakResetPasswordAPI(accessToken: string, userId: string, password: string): ChainableT<any> {
    return cy.task('keycloakRequest', {
        baseUrl,
        path: `users/${userId}/reset-password`,
        method: 'put',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        data: {type: 'password', temporary: false, value: password},
    }).then((response: AxiosResponse<Array<{id: string}>>) => {
        if (response.status === 200 && response.data.length > 0) {
            return cy.wrap(response.data[0].id);
        }
        return null;
    });
}
Cypress.Commands.add('keycloakResetPasswordAPI', keycloakResetPasswordAPI);

function keycloakGetUserAPI(accessToken: string, email: string): ChainableT<any> {
    return cy.task('keycloakRequest', {
        baseUrl,
        path: 'users?email=' + email,
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    }).then((response: AxiosResponse<Array<{id: string}>>) => {
        if (response.status === 200 && response.data.length > 0) {
            return cy.wrap(response.data[0].id);
        }
        return null;
    });
}
Cypress.Commands.add('keycloakGetUserAPI', keycloakGetUserAPI);

function keycloakDeleteUserAPI(accessToken: string, userId: string): ChainableT<any> {
    return cy.task('keycloakRequest', {
        baseUrl,
        path: `users/${userId}`,
        method: 'delete',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    }).then((response: AxiosResponse<any>) => {
        expect(response.status).to.equal(204);
        expect(response.data).is.empty;
    });
}

Cypress.Commands.add('keycloakDeleteUserAPI', keycloakDeleteUserAPI);

function keycloakUpdateUserAPI(accessToken: string, userId: string, data: any): ChainableT<any> {
    return cy.task('keycloakRequest', {
        baseUrl,
        path: 'users/' + userId,
        method: 'put',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    }).then((response: AxiosResponse<any>) => {
        expect(response.status).to.equal(204);
        expect(response.data).is.empty;
    });
}
Cypress.Commands.add('keycloakUpdateUserAPI', keycloakUpdateUserAPI);

function keycloakDeleteSessionAPI(accessToken: string, sessionId: string): ChainableT<any> {
    return cy.task('keycloakRequest', {
        baseUrl,
        path: `sessions/${sessionId}`,
        method: 'delete',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    }).then((delResponse: AxiosResponse<any>) => {
        expect(delResponse.status).to.equal(204);
        expect(delResponse.data).is.empty;
    });
}
Cypress.Commands.add('keycloakDeleteSessionAPI', keycloakDeleteSessionAPI);

function keycloakGetUserSessionsAPI(accessToken: string, userId: string): ChainableT<any> {
    return cy.task('keycloakRequest', {
        baseUrl,
        path: `users/${userId}/sessions`,
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    }).then((response: AxiosResponse<any>) => {
        expect(response.status).to.equal(200);
        expect(response.data);
        return cy.wrap(response.data);
    });
}
Cypress.Commands.add('keycloakGetUserSessionsAPI', keycloakGetUserSessionsAPI);

function keycloakDeleteUserSessions(accessToken: string, userId: string): ChainableT<any> {
    return cy.keycloakGetUserSessionsAPI(accessToken, userId).then((responseData: Array<{id: string}>) => {
        if (responseData.length > 0) {
            Object.values(responseData).forEach((data) => {
                const sessionId = data.id;
                cy.keycloakDeleteSessionAPI(accessToken, sessionId);
            });

            // Ensure we clear out these specific cookies
            ['JSESSIONID'].forEach((cookie) => {
                cy.clearCookie(cookie);
            });
        }
    });
}
Cypress.Commands.add('keycloakDeleteUserSessions', keycloakDeleteUserSessions);

interface KeycloakUser {
    email: string;
    keycloakId: string;
    password: string;
}

function keycloakResetUsers(users: KeycloakUser[]): ChainableT<any> {
    return cy.keycloakGetAccessTokenAPI().then((accessToken) => {
        Object.values(users).forEach((_user) => {
            cy.keycloakGetUserAPI(accessToken, _user.email).then((userId) => {
                if (userId) {
                    cy.keycloakDeleteUserAPI(accessToken, userId);
                }
            }).then(() => {
                cy.keycloakCreateUser(accessToken, _user).then((_id) => {
                    _user.keycloakId = _id;
                });
            });
        });
    });
}
Cypress.Commands.add('keycloakResetUsers', keycloakResetUsers);

function keycloakCreateUser(accessToken: string, user: KeycloakUser): ChainableT<string> {
    return cy.keycloakCreateUserAPI(accessToken, user).then(() => {
        cy.keycloakGetUserAPI(accessToken, user.email).then((newId) => {
            cy.keycloakResetPasswordAPI(accessToken, newId, user.password).then(() => {
                cy.keycloakDeleteUserSessions(accessToken, newId).then(() => {
                    return cy.wrap(newId);
                });
            });
        });
    });
}
Cypress.Commands.add('keycloakCreateUser', keycloakCreateUser);

function keycloakCreateUsers(users: KeycloakUser[] = []): ChainableT<any> {
    return cy.keycloakGetAccessTokenAPI().then((accessToken) => {
        return users.forEach((user) => {
            return cy.keycloakCreateUser(accessToken, user);
        });
    });
}
Cypress.Commands.add('keycloakCreateUsers', keycloakCreateUsers);

function keycloakUpdateUser(userEmail: string, data: Record<string, any>): ChainableT<any> {
    return cy.keycloakGetAccessTokenAPI().then((accessToken) => {
        return cy.keycloakGetUserAPI(accessToken, userEmail).then((userId) => {
            return cy.keycloakUpdateUserAPI(accessToken, userId, data);
        });
    });
}
Cypress.Commands.add('keycloakUpdateUser', keycloakUpdateUser);

function keycloakSuspendUser(userEmail: string): ChainableT<any> {
    const data = {enabled: false};
    return cy.keycloakUpdateUser(userEmail, data);
}
Cypress.Commands.add('keycloakSuspendUser', keycloakSuspendUser);

function keycloakUnsuspendUser(userEmail: string): ChainableT<any> {
    const data = {enabled: true};
    return cy.keycloakUpdateUser(userEmail, data);
}
Cypress.Commands.add('keycloakUnsuspendUser', keycloakUnsuspendUser);

function checkKeycloakLoginPage() {
    cy.findByText('Username or email', {timeout: TIMEOUTS.ONE_SEC}).should('be.visible');
    cy.findByText('Password').should('be.visible');
    cy.findAllByText('Log In').should('be.visible');
}
Cypress.Commands.add('checkKeycloakLoginPage', checkKeycloakLoginPage);

function doKeycloakLogin(user: KeycloakUser) {
    cy.apiLogout();
    cy.visit('/login');
    cy.findByText('SAML').click();
    cy.findByText('Username or email').type(user.email);
    cy.findByText('Password').type(user.password);
    cy.findAllByText('Log In').last().click();
}
Cypress.Commands.add('doKeycloakLogin', doKeycloakLogin);

function verifyKeycloakLoginFailed(): ChainableT<any> {
    return cy.findAllByText('Account is disabled, contact your administrator.').should('be.visible');
}
Cypress.Commands.add('verifyKeycloakLoginFailed', verifyKeycloakLoginFailed);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * keycloakGetAccessTokenAPI is a task wrapped as command with post-verification
             * that an Access Token is successfully retrieved
             * @returns {string} - access token
             */
            keycloakGetAccessTokenAPI: typeof keycloakGetAccessTokenAPI;

            /**
             * keycloakCreateUserAPI is a task wrapped as command with post-verification
             * that a user is successfully created in keycloak
             * @param {string} accessToken - a valid access token
             * @param {object} user - a keycloak user object to create
             *
             * @example
             *   cy.keycloakCreateUserAPI('abcde', {firstName: 'test', lastName: 'test', email: 'test', username: 'test', enabled: true,});
             */
            keycloakCreateUserAPI: typeof keycloakCreateUserAPI;

            /**
             * keycloakResetPasswordAPI is a task wrapped as command with post-verification
             * that a user password is successfully reset in keycloak
             * @param {string} accessToken - a valid access token
             * @param {string} userId - a keycloak userId
             * @param {string} password - new password to set
             *
             * @example
             *   cy.keycloakResetPasswordAPI('abcde', '12345', 'password');
             */
            keycloakResetPasswordAPI: typeof keycloakResetPasswordAPI;

            /**
             * keycloakGetUserAPI is a task wrapped as command with post-verification
             * that a user is successfully found in keycloak
             * @param {string} accessToken - a valid access token
             * @param {string} email - an email to query
             * @returns {string} - keycloak userId if found
             *
             * @example
             *   cy.keycloakGetUserAPI('abcde', 'test@mm.com');
             */
            keycloakGetUserAPI: typeof keycloakGetUserAPI;

            /**
             * keycloakDeleteUserAPI is a task wrapped as command with post-verification
             * that a user is successfully deleted in keycloak
             * @param {string} accessToken - a valid access token
             * @param {string} userId - keycloak user id to delete
             *
             * @example
             *   cy.keycloakDeleteUserAPI('abcde', '12345');
             */
            keycloakDeleteUserAPI: typeof keycloakDeleteUserAPI;

            /**
             * keycloakUpdateUserAPI is a task wrapped as command with post-verification
             * that a user is successfully updated in keycloak
             * @param {string} accessToken - a valid access token
             * @param {string} userId - keycloak user id to delete
             * @param {object} data - keycloak user object
             *
             * @example
             *   cy.keycloakUpdateUserAPI('abcde', '12345', {'enabled': false}});
             */
            keycloakUpdateUserAPI: typeof keycloakUpdateUserAPI;

            /**
             * keycloakDeleteSessionAPI is a task wrapped as command with post-verification
             * that a users session is successfully deleted in keycloak
             * @param {string} accessToken - a valid access token
             * @param {string} sessionId- keycloak session id to delete
             *
             * @example
             *   cy.keycloakDeleteSessionAPI('abcde', '12345');
             */
            keycloakDeleteSessionAPI: typeof keycloakDeleteSessionAPI;

            /**
             * keycloakGetUserSessionsAPI is a task wrapped as command with post-verification
             * that a users sessions are successfully found
             * @param {string} accessToken - a valid access token
             * @param {string} userId - keycloak user id to find sessions
             * @returns {string[]} - array of keycloak session ids
             *
             * @example
             *   cy.keycloakGetUserSessionsAPI('abcde', '12345');
             */
            keycloakGetUserSessionsAPI: typeof keycloakGetUserSessionsAPI;

            /**
             * keycloakDeleteUserSessions is a command that finds a user's sessions
             * and deletes them.
             * @param {string} accessToken - a valid access token
             * @param {string} userId- keycloak user id to delete sessions
             *
             * @example
             *   cy.keycloakDeleteUserSessions('abcde', '12345');
             */
            keycloakDeleteUserSessions: typeof keycloakDeleteUserSessions;

            /**
             * keycloakResetUsers is a command that "resets" (deletes and re-creates) the users.
             * @param {object[]} users - an array of user objects
             *
             * @example
             *   cy.keycloakResetUsers([{firstName: 'test', lastName: 'test', email: 'test', username: 'test', enabled: true}]);
             */
            keycloakResetUsers: typeof keycloakResetUsers;

            /**
             * keycloakCreateUser is a command that creates a keycloak user.
             * @param {User} user - a user object
             *
             * @example
             *   cy.keycloakCreateUser({firstName: 'test', lastName: 'test', email: 'test', username: 'test', enabled: true});
             */
            keycloakCreateUser: typeof keycloakCreateUser;

            /**
             * keycloakCreateUsers is a command that creates a list of keycloak users.
             */
            keycloakCreateUsers: typeof keycloakCreateUsers;

            keycloakUpdateUser: typeof keycloakUpdateUser;

            /**
             * keycloakSuspendUser is a command that suspends a user (enabled=false)
             * @param {string} userEmail - email of keycloak user
             *
             * @example
             *   cy.keycloakSuspendUser('user@test.com');
             */
            keycloakSuspendUser: typeof keycloakSuspendUser;

            /**
             * keycloakUnsuspendUser is a command that re-activates a user (enabled=true)
             * @param {string} userEmail - email of keycloak user
             *
             * @example
             *   cy.keycloakUnsuspendUser('user@test.com');
             */
            keycloakUnsuspendUser: typeof keycloakUnsuspendUser;

            /**
             * checkKeycloakLoginPage is a command that verifies the keycloak login page is displayed
             *
             * @example
             *   cy.checkKeycloakLoginPage();
             */
            checkKeycloakLoginPage: ChainableT<void>;

            /**
             * doKeycloakLogin is a command that attempts to log a user into keycloak.
             *
             * @example
             *   cy.doKeycloakLogin();
             */
            doKeycloakLogin(user: KeycloakUser): ChainableT<any>;

            /**
             * verifyKeycloakLoginFailed is a command that verifies a keycloak login failed.
             *
             * @example
             *   cy.verifyKeycloakLoginFailed();
             */
            verifyKeycloakLoginFailed: typeof verifyKeycloakLoginFailed;
        }
    }
}
