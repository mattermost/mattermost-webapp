// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getRandomInt} from '../utils';

import users from '../fixtures/users.json';
import theme from '../fixtures/theme.json';

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
    return cy.request({
        url: '/api/v4/users/logout',
        method: 'POST',
    });
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
