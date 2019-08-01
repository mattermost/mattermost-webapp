// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import merge from 'merge-deep';

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
Cypress.Commands.add('apiLogin', (username = 'user-1', password = null) => {
    cy.apiLogout();

    let loginId;
    let pw;

    if (password) {
        loginId = username;
        pw = password;
    } else {
        loginId = users[username].username;
        pw = users[username].password;
    }

    cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/login',
        method: 'POST',
        body: {login_id: loginId, password: pw},
    }).its('status').should('equal', 200);
});

/**
 * Logout a user directly via API
 */
Cypress.Commands.add('apiLogout', () => {
    cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/logout',
        method: 'POST',
        log: false,
    });

    // Ensure we clear out these specific cookies
    ['MMAUTHTOKEN', 'MMUSERID', 'MMCSRF'].forEach((cookie) => {
        cy.clearCookie(cookie);
    });

    // Clear remainder of cookies
    cy.clearCookies();

    cy.getCookies({log: false}).should('be.empty');
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
    }).then((response) => {
        expect(response.status).to.equal(201);
        return cy.wrap(response);
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
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Updates a channel directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {String} channelId - The channel's id, not updatable
 * @param {Object} channelData
 *   {String} name - The unique handle for the channel, will be present in the channel URL
 *   {String} display_name - The non-unique UI name for the channel
 *   {String} type - 'O' for a public channel (default), 'P' for a private channel
 *   {String} purpose - A short description of the purpose of the channel
 *   {String} header - Markdown-formatted text to display in the header of the channel
 * Only channelId is required
 */
Cypress.Commands.add('apiUpdateChannel', (channelId, channelData) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/channels/' + channelId,
        method: 'PUT',
        body: {
            id: channelId,
            ...channelData,
        },
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Partially update a channel directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {String} channelId - The channel's id, not updatable
 * @param {Object} channelData
 *   {String} name - The unique handle for the channel, will be present in the channel URL
 *   {String} display_name - The non-unique UI name for the channel
 *   {String} purpose - A short description of the purpose of the channel
 *   {String} header - Markdown-formatted text to display in the header of the channel
 * Only channelId is required
 */
Cypress.Commands.add('apiPatchChannel', (channelId, channelData) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'PUT',
        url: `/api/v4/channels/${channelId}/patch`,
        body: channelData,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

Cypress.Commands.add('apiGetChannelByName', (channelName) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/channels/name/${channelName}`,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

Cypress.Commands.add('apiAddUserToChannel', (channelId, userId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/channels/' + channelId + '/members',
        method: 'POST',
        body: {
            user_id: userId,
        },
    }).then((response) => {
        expect(response.status).to.equal(201);
        return cy.wrap(response);
    });
});

// *****************************************************************************
// Commands
// https://api.mattermost.com/#tag/commands
// *****************************************************************************

/**
 * Creates a command directly via API
 * This API assume that the user is logged in and has required permission to create a command
 * @param {Object} command - command to be created
 */
Cypress.Commands.add('apiCreateCommand', (command = {}) => {
    const options = {
        url: '/api/v4/commands',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'POST',
        body: command,
    };

    return cy.request(options).then((response) => {
        expect(response.status).to.equal(201);
        return {data: response.body, status: response.status};
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
    }).then((response) => {
        expect(response.status).to.equal(201);
        cy.wrap(response);
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

Cypress.Commands.add('apiPatchTeam', (teamId, teamData) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/teams/${teamId}/patch`,
        method: 'PUT',
        body: teamData,
    }).then((response) => {
        expect(response.status).to.equal(200);
        cy.wrap(response);
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

/**
 * Add user into a team directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {String} teamId - The team ID
 * @param {String} userId - ID of user to be added into a team
 * All parameter required
 */
Cypress.Commands.add('apiAddUserToTeam', (teamId, userId) => {
    cy.request({
        method: 'POST',
        url: `/api/v4/teams/${teamId}/members`,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        body: {team_id: teamId, user_id: userId},
        qs: {team_id: teamId},
    }).then((response) => {
        expect(response.status).to.equal(201);
        return cy.wrap(response);
    });
});

/**
 * List users that are not team members
 * @param {String} teamId - The team GUID
 * @param {Integer} page - The desired page of the paginated list
 * @param {Integer} perPage - The number of users per page
 * All parameter required
 */
Cypress.Commands.add('apiGetUsersNotInTeam', (teamId, page = 0, perPage = 60) => {
    return cy.request({
        method: 'GET',
        url: `/api/v4/users?not_in_team=${teamId}&page=${page}&per_page=${perPage}`,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
    });
});

/**
 * Join teammates directly via API
 * @param {String} teamId - The team GUID
 * @param {Array} teamMembers - The user IDs to join
 * All parameter required
 */
Cypress.Commands.add('apiAddUsersToTeam', (teamId, teamMembers) => {
    return cy.request({
        method: 'POST',
        url: `/api/v4/teams/${teamId}/members/batch`,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        body: teamMembers,
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
Cypress.Commands.add('apiSaveUserPreference', (preferences = [], userId = 'me') => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/users/${userId}/preferences`,
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
 * Saves teammate name display preference of a user directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {String} value - Either "username" (default), "nickname_full_name" or "full_name"
 */
Cypress.Commands.add('apiSaveTeammateNameDisplayPreference', (value = 'username') => {
    return cy.getCookie('MMUSERID').then((cookie) => {
        const preference = {
            user_id: cookie.value,
            category: 'display_settings',
            name: 'name_format',
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

/**
 * Creates a new user via the API, adds them to 3 teams, and sets preference to bypass tutorial.
 * Then logs in as the user
 * @param {Object} user - Object of user email, username, and password that you can optionally set.
 * @param {Array} teamIDs - list of teams to add the new user to
 * @param {Boolean} bypassTutorial - whether to set user preferences to bypass the tutorial on first login (true) or to show it (false)
 * Otherwise use default values
 @returns {Object} Returns object containing email, username, id and password if you need it further in the test
 */

Cypress.Commands.add('createNewUser', (user = {}, teamIds = [], bypassTutorial = true) => {
    const timestamp = Date.now();

    const {
        email = `user${timestamp}@sample.mattermost.com`,
        username = `user${timestamp}`,
        firstName = `First${timestamp}`,
        lastName = `Last${timestamp}`,
        nickname = `NewE2ENickname${timestamp}`,
        password = 'password123'} = user;

    // # Login as sysadmin to make admin requests
    cy.apiLogin('sysadmin');

    // # Create a new user
    return cy.request({method: 'POST', url: '/api/v4/users', body: {email, username, first_name: firstName, last_name: lastName, password, nickname}}).then((userResponse) => {
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
                // Verify we have at least 2 teams in the response to add the user to
                expect(teamsResponse).to.have.property('body').to.have.length.greaterThan(1);

                // Pull out only the first 2 teams
                teamsResponse.body.slice(0, 2).map((t) => t.id).forEach((teamId) => {
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

/**
 * Creates a new user via the API , adds them to 3 teams, and sets preference to bypass tutorial.
 * Then logs in as the user
 * @param {Object} user - Object of user email, username, and password that you can optionally set.
 * @param {Boolean} bypassTutorial - Whether to set user preferences to bypass the tutorial (true) or to show it (false)
 * Otherwise use default values
 @returns {Object} Returns object containing email, username, id and password if you need it further in the test
 */
Cypress.Commands.add('loginAsNewUser', (user = {}, bypassTutorial = true) => {
    return cy.createNewUser(user, [], bypassTutorial).then((newUser) => {
        cy.request({
            headers: {'X-Requested-With': 'XMLHttpRequest'},
            url: '/api/v4/users/login',
            method: 'POST',
            body: {login_id: newUser.username, password: newUser.password},
        }).then(() => {
            cy.visit('/');

            return cy.wrap(newUser);
        });
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
        });
    });
});

// *****************************************************************************
// Posts
// https://api.mattermost.com/#tag/posts
// *****************************************************************************

/**
* Unpins pinned posts of given postID directly via API
* This API assume that the user is logged in and has cookie to access
* @param {String} postId - Post ID of the pinned post to unpin
*/
Cypress.Commands.add('apiUnpinPosts', (postId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/posts/' + postId + '/unpin',
        method: 'POST',
    });
});

// *****************************************************************************
// System config
// https://api.mattermost.com/#tag/system
// *****************************************************************************

Cypress.Commands.add('apiUpdateConfig', (newSettings = {}) => {
    cy.apiLogin('sysadmin');

    // # Get current settings
    cy.request('/api/v4/config').then((response) => {
        const oldSettings = response.body;

        const settings = merge(oldSettings, newSettings);

        // # Set the modified settings
        cy.request({
            url: '/api/v4/config',
            headers: {'X-Requested-With': 'XMLHttpRequest'},
            method: 'PUT',
            body: settings,
        });
    });

    cy.apiLogout();
});

Cypress.Commands.add('apiGetConfig', () => {
    cy.apiLogin('sysadmin');

    // # Get current settings
    return cy.request('/api/v4/config').then((response) => {
        expect(response.status).to.equal(200);
        cy.wrap(response);
    });
});

// *****************************************************************************
// Webhooks
// https://api.mattermost.com/#tag/webhooks
// *****************************************************************************

Cypress.Commands.add('apiCreateWebhook', (hook = {}, isIncoming = true) => {
    const hookUrl = isIncoming ? '/api/v4/hooks/incoming' : '/api/v4/hooks/outgoing';
    const options = {
        url: hookUrl,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'POST',
        body: hook,
    };

    return cy.request(options).then((response) => {
        const data = response.body;
        return {...data, url: isIncoming ? `${Cypress.config().baseUrl}/hooks/${data.id}` : ''};
    });
});
