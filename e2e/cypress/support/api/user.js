// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getRandomId} from '../../utils';
import {getAdminAccount} from '../env';

// *****************************************************************************
// Users
// https://api.mattermost.com/#tag/users
// *****************************************************************************

Cypress.Commands.add('apiLogin', (user) => {
    cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/login',
        method: 'POST',
        body: {login_id: user.username, password: user.password},
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({user: response.body});
    });
});

Cypress.Commands.add('apiAdminLogin', () => {
    const admin = getAdminAccount();

    return cy.apiLogin(admin);
});

Cypress.Commands.add('apiLogout', () => {
    cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/logout',
        method: 'POST',
        log: false,
    });

    // * Verify logged out
    cy.visit('/login?extra=expired').url().should('include', '/login?extra=expired');

    // # Ensure we clear out these specific cookies
    ['MMAUTHTOKEN', 'MMUSERID', 'MMCSRF'].forEach((cookie) => {
        cy.clearCookie(cookie);
    });

    // # Clear remainder of cookies
    cy.clearCookies();

    // * Verify cookies are empty
    cy.getCookies({log: false}).should('be.empty');
});

Cypress.Commands.add('apiGetMe', () => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: 'api/v4/users/me',
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        cy.wrap({user: response.body});
    });
});

Cypress.Commands.add('apiGetUserByEmail', (email) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/email/' + email,
    }).then((response) => {
        expect(response.status).to.equal(200);
        cy.wrap({user: response.body});
    });
});

Cypress.Commands.add('apiGetUsersByUsernames', (usernames = []) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/usernames',
        method: 'POST',
        body: usernames,
    }).then((response) => {
        expect(response.status).to.equal(200);
        cy.wrap({users: response.body});
    });
});

Cypress.Commands.add('apiPatchUser', (userId, userData) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'PUT',
        url: `/api/v4/users/${userId}/patch`,
        body: userData,
    }).then((response) => {
        expect(response.status).to.equal(200);
        cy.wrap({user: response.body});
    });
});

Cypress.Commands.add('apiPatchMe', (data) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/me/patch',
        method: 'PUT',
        body: data,
    }).then((response) => {
        expect(response.status).to.equal(200);
        cy.wrap({user: response.body});
    });
});

Cypress.Commands.add('apiCreateAdmin', () => {
    const {username, password} = getAdminAccount();

    const sysadminUser = {
        username,
        password,
        first_name: 'Kenneth',
        last_name: 'Moreno',
        email: 'sysadmin@sample.mattermost.com',
    };

    const options = {
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'POST',
        url: '/api/v4/users',
        body: sysadminUser,
    };

    // # Create a new user
    return cy.request(options).then((res) => {
        expect(res.status).to.equal(201);

        cy.wrap({sysadmin: res.body});
    });
});

function generateRandomUser(prefix = 'user') {
    const randomId = getRandomId();

    return {
        email: `${prefix}${randomId}@sample.mattermost.com`,
        username: `${prefix}${randomId}`,
        password: 'passwd',
        first_name: `First${randomId}`,
        last_name: `Last${randomId}`,
        nickname: `Nickname${randomId}`,
    };
}

Cypress.Commands.add('apiCreateUser', ({prefix = 'user', bypassTutorial = true, user = null} = {}) => {
    const newUser = user || generateRandomUser(prefix);

    const createUserOption = {
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'POST',
        url: '/api/v4/users',
        body: newUser,
    };

    return cy.request(createUserOption).then((userRes) => {
        expect(userRes.status).to.equal(201);

        const createdUser = userRes.body;

        if (bypassTutorial) {
            cy.apiSaveTutorialStep(createdUser.id, '999');
        }

        return cy.wrap({user: {...createdUser, password: newUser.password}});
    });
});

Cypress.Commands.add('apiCreateGuestUser', ({prefix = 'guest', activate = true} = {}) => {
    return cy.apiCreateUser({prefix}).then(({user}) => {
        cy.demoteUser(user.id);
        cy.externalActivateUser(user.id, activate);

        return cy.wrap({guest: user});
    });
});

/**
 * Revoke all active sessions for a user
 * @param {String} userId - ID of user to revoke sessions
 */
Cypress.Commands.add('apiRevokeUserSessions', (userId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/users/${userId}/sessions/revoke/all`,
        method: 'POST',
    }).then((response) => {
        expect(response.status).to.equal(200);
        cy.wrap({data: response.body});
    });
});

Cypress.Commands.add('apiGetUsersNotInTeam', ({teamId, page = 0, perPage = 60} = {}) => {
    return cy.request({
        method: 'GET',
        url: `/api/v4/users?not_in_team=${teamId}&page=${page}&per_page=${perPage}`,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
    }).then((response) => {
        expect(response.status).to.equal(200);
        cy.wrap({users: response.body});
    });
});
