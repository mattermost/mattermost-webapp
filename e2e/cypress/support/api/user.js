// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getRandomId} from '../../utils';
import {getAdminAccount} from '../env';

// *****************************************************************************
// Users
// https://api.mattermost.com/#tag/users
// *****************************************************************************

Cypress.Commands.add('apiGetUserByEmail', (email) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/email/' + email,
    }).then((response) => {
        expect(response.status).to.equal(200);
        cy.wrap(response);
    });
});

Cypress.Commands.add('apiGetUsers', (usernames = []) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/usernames',
        method: 'POST',
        body: usernames,
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
        cy.wrap(response);
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
        cy.wrap(response);
    });
});

/**
 * Do not use. To be deprecated soon.
 * Creates a new user via the API, adds them to 3 teams, and sets preference to bypass tutorial.
 * Then logs in as the user
 * @param {Object} user - Object of user email, username, and password that you can optionally set.
 * @param {Array} teamIDs - list of teams to add the new user to
 * @param {Boolean} bypassTutorial - whether to set user preferences to bypass the tutorial on first login (true) or to show it (false)
 * Otherwise use default values
 @returns {Object} Returns object containing email, username, id and password if you need it further in the test
 */

Cypress.Commands.add('apiCreateNewUser', (user = {}, teamIds = [], bypassTutorial = true) => {
    const randomId = getRandomId();

    const {
        email = `user${randomId}@sample.mattermost.com`,
        username = `user${randomId}`,
        firstName = `First${randomId}`,
        lastName = `Last${randomId}`,
        nickname = `NewE2ENickname${randomId}`,
        password = 'password123',
    } = user;

    const createUserOption = {
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'POST',
        url: '/api/v4/users',
        body: {email, username, first_name: firstName, last_name: lastName, password, nickname},
    };

    // # Create a new user
    return cy.request(createUserOption).then((userResponse) => {
        // Safety assertions to make sure we have a valid response
        expect(userResponse).to.have.property('body').to.have.property('id');

        const userId = userResponse.body.id;

        if (teamIds && teamIds.length > 0) {
            teamIds.forEach((teamId) => {
                cy.apiAddUserToTeam(teamId, userId);
            });
        } else {
            // Get teams, select the first three, and add new user to that team
            cy.request('GET', '/api/v4/teams').then((teamsResponse) => {
                // Verify we have at least 1 team in the response to add the user to
                expect(teamsResponse).to.have.property('body').to.have.length.greaterThan(0);

                // Also add the user to the default team ad-1
                teamsResponse.body.
                    filter((t) => t.name === 'ad-1').
                    map((t) => t.id).
                    forEach((teamId) => {
                        cy.apiAddUserToTeam(teamId, userId);
                    });
            });
        }

        // # If the bypass flag is true, bypass tutorial
        if (bypassTutorial === true) {
            const preferences = [{
                user_id: userId,
                category: 'tutorial_step',
                name: userId,
                value: '999',
            }];

            cy.apiSaveUserPreference(preferences, userId);
        }

        // Wrap our user object so it gets returned from our cypress command
        cy.wrap({email, username, password, id: userId, firstName, lastName, nickname});
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

Cypress.Commands.add('apiCreateGuestUser', (options = {}) => {
    const prefix = options.prefix || 'guest';

    return cy.apiCreateUser({...options, prefix}).then(({user}) => {
        cy.demoteUser(user.id);

        return cy.wrap({guest: user});
    });
});

/**
 * Saves channel display mode preference of a user directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {String} status - "online" (default), "offline", "away" or "dnd"
 */
Cypress.Commands.add('apiUpdateUserStatus', (status = 'online') => {
    return cy.getCookie('MMUSERID').then((cookie) => {
        const data = {user_id: cookie.value, status};

        return cy.request({
            headers: {'X-Requested-With': 'XMLHttpRequest'},
            url: '/api/v4/users/me/status',
            method: 'PUT',
            body: data,
        }).then((response) => {
            expect(response.status).to.equal(200);
            cy.wrap({status: response.body});
        });
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
        cy.wrap(response);
    });
});
