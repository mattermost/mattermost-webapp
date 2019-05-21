// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getRandomInt} from '../utils';

import users from '../fixtures/users.json';
import theme from '../fixtures/theme.json';
import config from '../fixtures/config.json';

/* eslint max-nested-callbacks: ["error", 5] */
/* eslint-disable func-names */

// *****************************************************************************
// Read more:
// - https://on.cypress.io/custom-commands on writing Cypress commands
// - https://api.mattermost.com/ for Mattermost API reference
// *****************************************************************************

// *****************************************************************************
// Authentication
// https://api.mattermost.com/#tag/authentication
// *****************************************************************************

/**
 * Login a user directly via API
 * @param {String} username - e.g. "user-1" (default)
 */
Cypress.Commands.add('apiLogin', (username = 'user-1') => {
    const user = users[username];

    return cy.request({
        url: '/api/v4/users/login',
        method: 'POST',
        body: {login_id: user.username, password: user.password},
    });
});

/**
 * Logout a user directly via API
 */
Cypress.Commands.add('apiLogout', () => {
    cy.request({
        url: '/api/v4/users/logout',
        method: 'POST',
    });

    cy.clearCookies();
});

// *****************************************************************************
// Channels
// https://api.mattermost.com/#tag/channels
// *****************************************************************************

/**
 * Creates a channel directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {String} teamId - The team ID of the team to create the channel on
 * @param {String} name - The unique handle for the channel, will be present in the channel URL
 * @param {String} displayName - The non-unique UI name for the channel
 * @param {String} type - 'O' for a public channel (default), 'P' for a private channel
 * @param {String} purpose - A short description of the purpose of the channel
 * @param {String} header - Markdown-formatted text to display in the header of the channel
 * All parameters required except purpose and header
 */
Cypress.Commands.add('apiCreateChannel', (teamId, name, displayName, type = 'O', purpose = '', header = '') => {
    const uniqueName = `${name}-${getRandomInt(9999).toString()}`;

    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/channels',
        method: 'POST',
        body: {
            team_id: teamId,
            name: uniqueName,
            display_name: displayName,
            type,
            purpose,
            header,
        },
    });
});

/**
 * Deletes a channel directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {String} channelId - The channel ID to be deleted
 * All parameter required
 */
Cypress.Commands.add('apiDeleteChannel', (channelId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/channels/' + channelId,
        method: 'DELETE',
    });
});

// *****************************************************************************
// Teams
// https://api.mattermost.com/#tag/teams
// *****************************************************************************

/**
 * Creates a team directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {String} name - Unique handler for a team, will be present in the team URL
 * @param {String} displayName - Non-unique UI name for the team
 * @param {String} type - 'O' for open (default), 'I' for invite only
 * All parameters required
 */
Cypress.Commands.add('apiCreateTeam', (name, displayName, type = 'O') => {
    const uniqueName = `${name}-${getRandomInt(9999).toString()}`;

    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/teams',
        method: 'POST',
        body: {
            name: uniqueName,
            display_name: displayName,
            type,
        },
    });
});

/**
 * Deletes a team directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {String} teamId - The team ID to be deleted
 * All parameter required
 */
Cypress.Commands.add('apiDeleteTeam', (teamId, permanent = false) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/teams/' + teamId + (permanent ? '/?permanent=true' : ''),
        method: 'DELETE',
    });
});

/**
 * Gets a list of the current user's teams
 * This API assume that the user is logged
 * no params required because we are using /me to refer to current user
 */

Cypress.Commands.add('apiGetTeams', () => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: 'api/v4/users/me/teams',
        method: 'GET',
    });
});

// *****************************************************************************
// Preferences
// https://api.mattermost.com/#tag/preferences
// *****************************************************************************

/**
 * Saves user's preference directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {Array} preference - a list of user's preferences
 */
Cypress.Commands.add('apiSaveUserPreference', (preferences = []) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/me/preferences',
        method: 'PUT',
        body: preferences,
    });
});

/**
 * Saves channel display mode preference of a user directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {String} value - Either "full" (default) or "centered"
 */
Cypress.Commands.add('apiSaveChannelDisplayModePreference', (value = 'full') => {
    return cy.getCookie('MMUSERID').then((cookie) => {
        const preference = {
            user_id: cookie.value,
            category: 'display_settings',
            name: 'channel_display_mode',
            value,
        };

        return cy.apiSaveUserPreference([preference]);
    });
});

/**
 * Saves message display preference of a user directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {String} value - Either "clean" (default) or "compact"
 */
Cypress.Commands.add('apiSaveMessageDisplayPreference', (value = 'clean') => {
    return cy.getCookie('MMUSERID').then((cookie) => {
        const preference = {
            user_id: cookie.value,
            category: 'display_settings',
            name: 'message_display',
            value,
        };

        return cy.apiSaveUserPreference([preference]);
    });
});

/**
 * Saves theme preference of a user directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {Object} value - theme object.  Will pass default value if none is provided.
 */
Cypress.Commands.add('apiSaveThemePreference', (value = JSON.stringify(theme.default)) => {
    return cy.getCookie('MMUSERID').then((cookie) => {
        const preference = {
            user_id: cookie.value,
            category: 'theme',
            name: '',
            value,
        };

        return cy.apiSaveUserPreference([preference]);
    });
});

/**
 * Saves Enable Open Server settings config details of a user directly via API
 * This API assume that the sysadmin user is logged in for the changes
 * @param {Boolean} enable - flag for EnableOpenServer in config. Passes true for default if none is provided.
 */
Cypress.Commands.add('apiEnableOpenServer', (enable = true) => {
    config.TeamSettings.EnableOpenServer = enable;
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/config',
        method: 'PUT',
        body: config,
    });
});

/**
 * Creates a new user via the API, adds them to 3 teams, and sets preference to bypass tutorial.
 * Then logs in as the user
 @param {Object} user - Object of user email, username, and password that you can optionally set. Otherwise use default values
 @returns {Object} Returns object containing email, username, id and password if you need it further in the test
 */
Cypress.Commands.add('loginAsNewUser', (user = {}) => {
    const timestamp = Date.now();

    const {email = `newE2ETestUser${timestamp}@mattermost.com`, username = `NewE2ETestUser${timestamp}`, password = 'password123'} = user;

    // # Login as sysadmin to make admin requests
    cy.apiLogin('sysadmin');

    // # Create a new user
    return cy.request({method: 'POST', url: '/api/v4/users', body: {email, username, password}}).then((userResponse) => {
        // Safety assertions to make sure we have a valid response
        expect(userResponse).to.have.property('body').to.have.property('id');

        const userId = userResponse.body.id;

        // Get teams, select the first three, and add new user to that team
        cy.request('GET', '/api/v4/teams').then((teamsResponse) => {
            // Verify we have at least 2 teams in the response to add the user to
            expect(teamsResponse).to.have.property('body').to.have.length.greaterThan(1);

            const [team1, team2] = teamsResponse.body;

            // Add user to several teams
            [team1, team2].forEach((team) => {
                cy.request({
                    method: 'POST',
                    url: `/api/v4/teams/${team.id}/members`,
                    headers: {'X-Requested-With': 'XMLHttpRequest'},
                    body: {team_id: team.id, user_id: userId},
                    qs: {team_id: team.id}});
            });
        });

        // # Login as the new user
        cy.request({
            url: '/api/v4/users/login',
            method: 'POST',
            body: {login_id: username, password},
        });

        // # Update new user preferences to bypass tutorial
        const preferences = [{
            user_id: userId,
            category: 'tutorial_step',
            name: userId,
            value: '999',
        }];

        cy.apiSaveUserPreference(preferences);
        cy.visit('/');

        // Wrap our user object so it gets returnd from our cypress command
        cy.wrap({email, username, password, id: userId});
    });
});

// *****************************************************************************
// Pinned Posts
// *****************************************************************************

/**
* Unpins pinned posts of given postID directly via API
* This API assume that the user is logged in and has cookie to access
* @param {Object} postId - Post ID of the pinned post to unpin
*/
Cypress.Commands.add('apiUnpinPosts', (postId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/posts/' + postId + '/unpin',
        method: 'POST',
    });
});
