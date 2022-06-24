// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AxiosResponse} from 'axios';

import * as TIMEOUTS from '../fixtures/timeouts';

import {ChainableT} from './api/types';

const token = 'SSWS ' + Cypress.env('oktaMMAppToken');

interface InputUser {
    firstname: string;
    lastname: string;
    email: string;
    login: string;
    userType: string;
    isAdmin: boolean;
    isGuest: boolean;
    password?: string;
}

interface OktaUser {
    firstName: string;
    lastName: string;
    email: string;
    login: string;
    userType: string;
    isAdmin: boolean;
    isGuest: boolean;
    password?: string;
}
function buildProfile(user: InputUser): OktaUser {
    const profile = {
        firstName: user.firstname,
        lastName: user.lastname,
        email: user.email,
        login: user.email,
        userType: user.userType,
        isAdmin: user.isAdmin,
        isGuest: user.isGuest,
    };
    return profile;
}

function oktaCreateUser(user = {} as InputUser): ChainableT<string> {
    const profile = buildProfile(user);
    return cy.task('oktaRequest', {
        baseUrl: Cypress.env('oktaApiUrl'),
        urlSuffix: '/users/',
        method: 'post',
        token,
        data: {
            profile,
            credentials: {
                password: {value: user.password},
                recovery_question: {
                    question: 'What is the best open source messaging platform for developers?',
                    answer: 'Mattermost',
                },
            },
        },
    }).then((response: AxiosResponse<{id: string}>) => {
        expect(response.status).to.equal(200);
        const userId = response.data.id;
        return cy.wrap(Promise.resolve(userId));
    });
}
Cypress.Commands.add('oktaCreateUser', oktaCreateUser);

function oktaGetUser(userId = ''): ChainableT<string | null> {
    return cy.task('oktaRequest', {
        baseUrl: Cypress.env('oktaApiUrl'),
        urlSuffix: '/users?q=' + userId,
        method: 'get',
        token,
    }).then((response: AxiosResponse<Array<{id: string}>>) => {
        expect(response.status).to.be.equal(200);
        if (response.data.length > 0) {
            return cy.wrap(Promise.resolve(response.data[0].id));
        }
        return cy.wrap(Promise.resolve(null));
    });
}
Cypress.Commands.add('oktaGetUser', oktaGetUser);

function oktaUpdateUser(userId = '', user = {} as InputUser): ChainableT<OktaUser> {
    const profile = buildProfile(user);

    return cy.task('oktaRequest', {
        baseUrl: Cypress.env('oktaApiUrl'),
        urlSuffix: '/users/' + userId,
        method: 'post',
        token,
        data: {
            profile,
        },
    }).then((response: AxiosResponse<OktaUser>) => {
        expect(response.status).to.equal(201);
        return cy.wrap(Promise.resolve(response.data));
    });
}
Cypress.Commands.add('oktaUpdateUser', oktaUpdateUser);

//first we deactivate the user, then we actually delete it
function oktaDeleteUser(userId = '') {
    cy.task('oktaRequest', {
        baseUrl: Cypress.env('oktaApiUrl'),
        urlSuffix: '/users/' + userId,
        method: 'delete',
        token,
    }).then((response: AxiosResponse<any>) => {
        expect(response.status).to.equal(204);
        expect(response.data).is.empty;
        cy.task('oktaRequest', {
            baseUrl: Cypress.env('oktaApiUrl'),
            urlSuffix: '/users/' + userId,
            method: 'delete',
            token,
        }).then((_response: AxiosResponse<any>) => {
            expect(_response.status).to.equal(204);
            expect(_response.data).is.empty;
        });
    });
}
Cypress.Commands.add('oktaDeleteUser', oktaDeleteUser);

function oktaDeleteSession(userId = '') {
    cy.task('oktaRequest', {
        baseUrl: Cypress.env('oktaApiUrl'),
        urlSuffix: '/users/' + userId + '/sessions',
        method: 'delete',
        token,
    }).then((response: AxiosResponse<any>) => {
        expect(response.status).to.equal(204);
        expect(response.data).is.empty;

        // Ensure we clear out these specific cookies
        ['JSESSIONID'].forEach((cookie) => {
            cy.clearCookie(cookie);
        });
    });
}
Cypress.Commands.add('oktaDeleteSession', oktaDeleteSession);

function oktaAssignUserToApplication(userId = '', user = {} as OktaUser): ChainableT<any> {
    return cy.task('oktaRequest', {
        baseUrl: Cypress.env('oktaApiUrl'),
        urlSuffix: '/apps/' + Cypress.env('oktaMMAppId') + '/users',
        method: 'post',
        token,
        data: {
            id: userId,
            scope: 'USER',
            profile: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
        },
    }).then((response: AxiosResponse<any>) => {
        expect(response.status).to.be.equal(200);
        return cy.wrap(response.data);
    });
}
Cypress.Commands.add('oktaAssignUserToApplication', oktaAssignUserToApplication);

function oktaGetOrCreateUser(user: OktaUser): ChainableT<string | undefined> {
    let userId: string | undefined;
    return cy.oktaGetUser(user.email).then((uId) => {
        userId = uId;
        if (userId == null) {
            cy.oktaCreateUser(user as unknown as InputUser).then((_uId) => {
                userId = _uId;
                cy.oktaAssignUserToApplication(userId, user);
            });
        } else {
            cy.oktaAssignUserToApplication(userId, user);
        }
        return cy.wrap(Promise.resolve(userId));
    });
}
Cypress.Commands.add('oktaGetOrCreateUser', oktaGetOrCreateUser);

function oktaAddUsers(users: {regulars: InputUser[]; guests: InputUser[]; admins: InputUser[]}) {
    let userId: string;
    Object.values(users.regulars).forEach((_user) => {
        cy.oktaGetUser(_user.email).then((uId) => {
            userId = uId;
            if (userId == null) {
                cy.oktaCreateUser(_user).then((_uId) => {
                    userId = _uId;
                    cy.oktaAssignUserToApplication(userId, _user as unknown as OktaUser);
                    cy.oktaDeleteSession(userId);
                });
            }
        });
    });

    Object.values(users.guests).forEach((_user) => {
        cy.oktaGetUser(_user.email).then((uId) => {
            userId = uId;
            if (userId == null) {
                cy.oktaCreateUser(_user).then((_uId) => {
                    userId = _uId;
                    cy.oktaAssignUserToApplication(userId, _user as unknown as OktaUser);
                    cy.oktaDeleteSession(userId);
                });
            }
        });
    });

    Object.values(users.admins).forEach((_user) => {
        cy.oktaGetUser(_user.email).then((uId) => {
            userId = uId;
            if (userId == null) {
                cy.oktaCreateUser(_user).then((_uId) => {
                    userId = _uId;
                    cy.oktaAssignUserToApplication(userId, _user as unknown as OktaUser);
                    cy.oktaDeleteSession(userId);
                });
            }
        });
    });
}
Cypress.Commands.add('oktaAddUsers', oktaAddUsers);

function oktaRemoveUsers(users: {regulars: OktaUser[]; guests: OktaUser[]; admins: OktaUser[]}) {
    let userId: string;
    Object.values(users.regulars).forEach((_user) => {
        cy.oktaGetUser(_user.email).then((_uId) => {
            userId = _uId;
            if (userId != null) {
                cy.oktaDeleteUser(userId);
            }
        });
    });

    Object.values(users.guests).forEach((_user) => {
        cy.oktaGetUser(_user.email).then((_uId) => {
            userId = _uId;
            if (userId != null) {
                cy.oktaDeleteUser(userId);
            }
        });
    });

    Object.values(users.admins).forEach((_user) => {
        cy.oktaGetUser(_user.email).then((_uId) => {
            userId = _uId;
            if (userId != null) {
                cy.oktaDeleteUser(userId);
            }
        });
    });
}
Cypress.Commands.add('oktaRemoveUsers', oktaRemoveUsers);

function checkOktaLoginPage() {
    cy.findByText('Powered by').should('be.visible');
    cy.findAllByText('Sign In').should('be.visible');
    cy.get('#okta-signin-password').should('be.visible');
    cy.get('#okta-signin-submit').should('be.visible');
}
Cypress.Commands.add('checkOktaLoginPage', checkOktaLoginPage);

function doOktaLogin(user: OktaUser) {
    cy.checkOktaLoginPage();

    cy.get('#okta-signin-username').type(user.email);
    cy.get('#okta-signin-password').type(user.password);
    cy.findAllByText('Sign In').last().click().wait(TIMEOUTS.FIVE_SEC);
}
Cypress.Commands.add('doOktaLogin', doOktaLogin);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            oktaCreateUser: typeof oktaCreateUser;
            oktaGetUser: typeof oktaGetUser;
            oktaUpdateUser: typeof oktaUpdateUser;
            oktaDeleteUser(userId: string): ChainableT<void>;
            oktaDeleteSession(userId: string): ChainableT<void>;
            oktaAssignUserToApplication: typeof oktaAssignUserToApplication;
            oktaGetOrCreateUser: typeof oktaGetOrCreateUser;
            oktaAddUsers(users: {regulars: InputUser[]; guests: InputUser[]; admins: InputUser[]}): ChainableT<void>;
            oktaRemoveUsers(users: {regulars: OktaUser[]; guests: OktaUser[]; admins: OktaUser[]}): ChainableT<void>;
            checkOktaLoginPage(): ChainableT<void>;
            doOktaLogin(user: OktaUser): ChainableT<void>;
        }
    }
}
