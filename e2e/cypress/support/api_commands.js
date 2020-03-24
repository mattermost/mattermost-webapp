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
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
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

/**
 * Get a list of all the bots
 * This API assumes that the user logged in has permission to read bots
 */

Cypress.Commands.add('apiGetBots', () => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/bots',
        method: 'GET',
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
    }).then((response) => {
        expect(response.status).to.equal(201);
        return cy.wrap(response);
    });
});

/**
 * Creates a new Direct channel directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {String} userids - array of userids
 * All parameters required
 */
Cypress.Commands.add('apiCreateDirectChannel', (userids) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/channels/direct',
        method: 'POST',
        body: userids,
    });
});

/**
 * Creates a group channel directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {String} userIds - IDs of users as member of the group
 * All parameters required except purpose and header
 */
Cypress.Commands.add('apiCreateGroupChannel', (userIds = []) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/channels/group',
        method: 'POST',
        body: userIds,
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

Cypress.Commands.add('apiGetChannelByName', (teamName, channelName) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/teams/name/${teamName}/channels/name/${channelName}`,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

Cypress.Commands.add('apiGetChannel', (channelId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/channels/${channelId}`,
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
        url: '/api/v4/teams/' + teamId + (permanent ? '?permanent=true' : ''),
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
 * Gets a list of all of the teams on the server
 * This API assume that the user is logged in as sysadmin
 */

Cypress.Commands.add('apiGetAllTeams', () => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: 'api/v4/teams',
        method: 'GET',
    });
});

/**
 * Gets current user
 * This API assume that the user is logged
 * no params required because we are using /me to refer to current user
 */

Cypress.Commands.add('apiGetMe', () => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: 'api/v4/users/me',
        method: 'GET',
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
    }).then((response) => {
        expect(response.status).to.equal(200);
        cy.wrap(response);
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
    }).then((response) => {
        expect(response.status).to.equal(201);
        cy.wrap(response);
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
 * Saves show markdown preview option preference of a user directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {String} value - Either "true" to show the options (default) or "false"
 */
Cypress.Commands.add('apiSaveShowMarkdownPreviewPreference', (value = 'true') => {
    return cy.getCookie('MMUSERID').then((cookie) => {
        const preference = {
            user_id: cookie.value,
            category: 'advanced_settings',
            name: 'feature_enabled_markdown_preview',
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

const defaultSidebarSettingPreference = {
    grouping: 'by_type',
    unreads_at_top: 'true',
    favorite_at_top: 'true',
    sorting: 'alpha',
};

/**
 * Saves theme preference of a user directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {Object} value - sidebar settings object.  Will pass default value if none is provided.
 */
Cypress.Commands.add('apiSaveSidebarSettingPreference', (value = {}) => {
    return cy.getCookie('MMUSERID').then((cookie) => {
        const newValue = {
            ...defaultSidebarSettingPreference,
            ...value,
        };

        const preference = {
            user_id: cookie.value,
            category: 'sidebar_settings',
            name: '',
            value: JSON.stringify(newValue),
        };

        return cy.apiSaveUserPreference([preference]);
    });
});

/**
 * Saves the preference on whether to show link and image previews
 * This API assume that the user is logged in and has cookie to access
 * @param {boolean} show - Either "true" to show link and images previews (default), or "false"
 */
Cypress.Commands.add('apiSaveShowPreviewPreference', (show = 'true') => {
    return cy.getCookie('MMUSERID').then((cookie) => {
        const preference = {
            user_id: cookie.value,
            category: 'display_settings',
            name: 'link_previews',
            value: show,
        };

        return cy.apiSaveUserPreference([preference]);
    });
});

/**
 * Saves the preference on whether to show link and image previews expanded
 * This API assume that the user is logged in and has cookie to access
 * @param {boolean} collapse - Either "true" to show previews collapsed (default), or "false"
 */
Cypress.Commands.add('apiSavePreviewCollapsedPreference', (collapse = 'true') => {
    return cy.getCookie('MMUSERID').then((cookie) => {
        const preference = {
            user_id: cookie.value,
            category: 'display_settings',
            name: 'collapse_previews',
            value: collapse,
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
                // Verify we have at least 2 teams in the response to add the user to
                expect(teamsResponse).to.have.property('body').to.have.length.greaterThan(1);

                // Pull out only the first 2 teams
                teamsResponse.body.
                    filter((t) => t.delete_at === 0).
                    slice(0, 2).
                    map((t) => t.id).
                    forEach((teamId) => {
                        cy.apiAddUserToTeam(teamId, userId);
                    });

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

/**
 * Creates a new user via the API , adds them to 3 teams, and sets preference to bypass tutorial.
 * Then logs in as the user
 * @param {Object} user - Object of user email, username, and password that you can optionally set.
 * @param {Boolean} bypassTutorial - Whether to set user preferences to bypass the tutorial (true) or to show it (false)
 * Otherwise use default values
 @returns {Object} Returns object containing email, username, id and password if you need it further in the test
 */
Cypress.Commands.add('loginAsNewUser', (user = {}, teamIds = [], bypassTutorial = true) => {
    return cy.createNewUser(user, teamIds, bypassTutorial).then((newUser) => {
        cy.apiLogout();
        cy.request({
            headers: {'X-Requested-With': 'XMLHttpRequest'},
            url: '/api/v4/users/login',
            method: 'POST',
            body: {login_id: newUser.username, password: newUser.password},
        }).then((response) => {
            expect(response.status).to.equal(200);
            cy.visit('/ad-1/channels/town-square');

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

Cypress.Commands.add('apiGetClientLicense', () => {
    cy.apiLogin('sysadmin');

    return cy.request('/api/v4/license/client?format=old').then((response) => {
        expect(response.status).to.equal(200);
        cy.wrap(response);
    });
});

Cypress.Commands.add('requireLicenseForFeature', (key = '') => {
    cy.apiGetClientLicense().then((response) => {
        const license = response.body;
        expect(license.IsLicensed, 'Server has no Enterprise license.').to.equal('true');

        let hasLicenseKey = false;
        for (const [k, v] of Object.entries(license)) {
            if (k === key && v === 'true') {
                hasLicenseKey = true;
                break;
            }
        }

        expect(hasLicenseKey, `No license for feature: ${key}`).to.equal(true);
    });
});

Cypress.Commands.add('requireLicense', () => {
    cy.apiGetClientLicense().then((response) => {
        const license = response.body;
        expect(license.IsLicensed, 'Server has no Enterprise license.').to.equal('true');
    });
});

Cypress.Commands.add('apiUpdateConfigBasic', (newSettings = {}) => {
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
        }).then((updateResponse) => {
            expect(updateResponse.status).to.equal(200);
        });
    });
});

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
        }).then((updateResponse) => {
            expect(updateResponse.status).to.equal(200);
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

/**
 * Get some analytics data about the system.
 */
Cypress.Commands.add('apiGetAnalytics', () => {
    cy.apiLogin('sysadmin');

    return cy.request('/api/v4/analytics/old').then((response) => {
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

/**
 * Gets a team on the system
 * * @param {String} teamId - The team ID to get
 * All parameter required
 */

Cypress.Commands.add('apiGetTeam', (teamId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `api/v4/teams/${teamId}`,
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Creates a new guest user via the API , adds them to 1 team with sysadmin user, and sets preference to bypass tutorial.
 * Then logs in as the user
 * @param {Object} user - Object of user email, username, and password that you can optionally set.
 * @param {Boolean} bypassTutorial - Whether to set user preferences to bypass the tutorial (true) or to show it (false)
 * Otherwise use default values
 @returns {Object} Returns object containing email, username, id and password if you need it further in the test
 */
Cypress.Commands.add('loginAsNewGuestUser', (user = {}, bypassTutorial = true) => {
    // # Login as sysadmin to make admin requests
    cy.apiLogin('sysadmin');

    // # Create a New Team for Guest User
    return cy.apiCreateTeam('guest-team', 'Guest Team').then((createResponse) => {
        const team = createResponse.body;
        cy.getCookie('MMUSERID').then((cookie) => {
            // #Assign Sysadmin user to the newly created team
            cy.apiAddUserToTeam(team.id, cookie.value);
        });

        // #Create New User
        return cy.createNewUser(user, [team.id], bypassTutorial).then((newUser) => {
            // # Demote Regular Member to Guest User
            cy.demoteUser(newUser.id);
            cy.request({
                headers: {'X-Requested-With': 'XMLHttpRequest'},
                url: '/api/v4/users/login',
                method: 'POST',
                body: {login_id: newUser.username, password: newUser.password},
            }).then(() => {
                cy.visit(`/${team.name}`);
                return cy.wrap(newUser);
            });
        });
    });
});

/**
 * Demote a Member to Guest directly via API
 * @param {String} userId - The user ID
 * All parameter required
 */
Cypress.Commands.add('demoteUser', (userId) => {
    //Demote Regular Member to Guest User
    const baseUrl = Cypress.config('baseUrl');
    cy.externalRequest({user: users.sysadmin, method: 'post', baseUrl, path: `users/${userId}/demote`});
});

/**
 * Remove a User from a Channel directly via API
 * @param {String} channelId - The channel ID
 * @param {String} userId - The user ID
 * All parameter required
 */
Cypress.Commands.add('removeUserFromChannel', (channelId, userId) => {
    //Remove a User from a Channel
    const baseUrl = Cypress.config('baseUrl');
    cy.externalRequest({user: users.sysadmin, method: 'delete', baseUrl, path: `channels/${channelId}/members/${userId}`});
});

/**
 * Remove a User from a Team directly via API
 * @param {String} teamID - The team ID
 * @param {String} userId - The user ID
 * All parameter required
 */
Cypress.Commands.add('removeUserFromTeam', (teamId, userId) => {
    //Remove a User from a Channel
    const baseUrl = Cypress.config('baseUrl');
    cy.externalRequest({user: users.sysadmin, method: 'delete', baseUrl, path: `teams/${teamId}/members/${userId}`});
});

/**
 * Promote a Guest to a Member directly via API
 * @param {String} userId - The user ID
 * All parameter required
 */
Cypress.Commands.add('promoteUser', (userId) => {
    //Promote Regular Member to Guest User
    const baseUrl = Cypress.config('baseUrl');
    cy.externalRequest({user: users.sysadmin, method: 'post', baseUrl, path: `users/${userId}/promote`});
});

// *****************************************************************************
// Plugins
// https://api.mattermost.com/#tag/plugins
// *****************************************************************************

/**
 * Install plugin from URL directly via API.
 *
 * @param {String} pluginDownloadUrl - URL used to download the plugin
 * @param {String} force - Set to 'true' to overwrite a previously installed plugin with the same ID, if any
 */
Cypress.Commands.add('installPluginFromUrl', (pluginDownloadUrl, force = false) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/plugins/install_from_url?plugin_download_url=${encodeURIComponent(pluginDownloadUrl)}&force=${force}`,
        method: 'POST',
        timeout: 60000,
    }).then((response) => {
        expect(response.status).to.equal(201);
        return cy.wrap(response);
    });
});

/**
 * Uninstall plugin by id.
 *
 * @param {String} pluginId - Id of the plugin to uninstall
 */
Cypress.Commands.add('uninstallPluginById', (pluginId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/plugins/${encodeURIComponent(pluginId)}`,
        method: 'DELETE',
        failOnStatusCode: false,
    }).then((response) => {
        if (response.status !== 200 && response.status !== 404) {
            expect(response.status).to.equal(200);
        }
        return cy.wrap(response);
    });
});

/**
 * Get all user`s plugins.
 *
 */
Cypress.Commands.add('getAllPlugins', () => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/plugins',
        method: 'GET',
        failOnStatusCode: false,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Enable plugin by id.
 *
 * @param {String} pluginId - Id of the plugin to enable
 */
Cypress.Commands.add('enablePluginById', (pluginId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/plugins/${encodeURIComponent(pluginId)}/enable`,
        method: 'POST',
        timeout: 60000,
        failOnStatusCode: true,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Upload binary file by name and Type *
 * @param {String} fileName - name of the plugin to upload
 * @param {String} fileType - type of the plugin to upload
 */
Cypress.Commands.add('uploadBinaryFileByName', (fileName, fileType) => {
    const formData = new FormData();

    // Get file from fixtures as binary
    cy.fixture(fileName, 'binary').then((content) => {
        // File in binary format gets converted to blob so it can be sent as Form data
        Cypress.Blob.binaryStringToBlob(content, fileType).then((blob) => {
            formData.set('plugin', blob, fileName);
            formRequest('POST', '/api/v4/plugins', formData);
        });
    });
});

/**
 * process binary file HTTP form request
 * @param {String} method - Http request method - POST/PUT
 * @param {String} url - HTTP resource URL
 * @param {FormData} FormData - Key value pairs representing form fields and value
 */
function formRequest(method, url, formData) {
    const baseUrl = Cypress.config('baseUrl');
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, false);
    let cookies = '';
    cy.getCookie('MMCSRF', {log: false}).then((token) => {
        //get MMCSRF cookie value
        const csrfToken = token.value;
        cy.getCookies({log: false}).then((cookieValues) => {
            //prepare cookie string
            cookieValues.forEach((cookie) => {
                cookies += cookie.name + '=' + cookie.value + '; ';
            });

            //set headers
            xhr.setRequestHeader('Access-Control-Allow-Origin', baseUrl);
            xhr.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST, PUT');
            xhr.setRequestHeader('X-CSRF-Token', csrfToken);
            xhr.setRequestHeader('Cookie', cookies);
            xhr.send(formData);
            if (xhr.readyState === 4) {
                expect(xhr.status, 'Expected form request to be processed successfully').to.equal(201);
            } else {
                expect(xhr.status, 'Form request process delayed').to.equal(201);
            }
        });
    });
}

/**
 * Creates a bot directly via API
 * This API assume that the user is logged in and has cookie to access
 * @param {String} username - The bots username
 * @param {String} displayName - The non-unique UI name for the bot
 * @param {String} description - The description of the bot
 * All parameters are required
 */
Cypress.Commands.add('apiCreateBot', (username, displayName, description) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/bots',
        method: 'POST',
        body: {
            username,
            display_name: displayName,
            description,
        },
    }).then((response) => {
        expect(response.status).to.equal(201);
        return cy.wrap(response);
    });
});

/**
 * Get access token
 * This API assume that the user is logged in and has cookie to access
 * @param {String} user_id - The user id to generate token for
 * @param {String} description - The description of the token usage
 * All parameters are required
 */
Cypress.Commands.add('apiAccessToken', (userId, description) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/' + userId + '/tokens',
        method: 'POST',
        body: {
            description,
        },
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response.body.token);
    });
});

/**
 * Get LDAP Group Sync Job Status
 *
 */
Cypress.Commands.add('apiGetLDAPSync', () => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/jobs/type/ldap_sync?page=0&per_page=50',
        method: 'GET',
        timeout: 60000,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

// *****************************************************************************
// Roles
// https://api.mattermost.com/#tag/roles
// *****************************************************************************

/**
 * Get role by name.
 *
 * @param {String} roleName - Name of the role to get
 */
Cypress.Commands.add('getRoleByName', (roleName) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/roles/name/${roleName}`,
        method: 'GET',
        timeout: 60000,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Patch a role.
 *
 * @param {String} roleID - ID of the role to patch
 * @param {String} force - Set to 'true' to overwrite a previously installed plugin with the same ID, if any
 */
Cypress.Commands.add('patchRole', (roleID, patch) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/roles/${roleID}/patch`,
        method: 'PUT',
        timeout: 60000,
        body: patch,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Get all schemes in the system - must have PERMISSION_MANAGE_SYSTEM
 *
 * @param {String} scope - either "team" or "channel"
 */
Cypress.Commands.add('apiGetSchemes', (scope) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/schemes?scope=${scope}`,
        method: 'GET',
    });
});

/**
 * Delete a scheme directly via API
 *
 * @param {String} schemeId - the id of the scheme to delete
 */
Cypress.Commands.add('apiDeleteScheme', (schemeId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/schemes/' + schemeId,
        method: 'DELETE',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Get all schemes in the system - must have PERMISSION_MANAGE_SYSTEM
 *
 * @param {String} scope - either "team" or "channel"
 */
Cypress.Commands.add('apiGetSchemes', (scope) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/schemes?scope=${scope}`,
        method: 'GET',
    });
});

/**
 * Delete a scheme directly via API
 *
 * @param {String} schemeId - the id of the scheme to delete
 */
Cypress.Commands.add('apiDeleteScheme', (schemeId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/schemes/' + schemeId,
        method: 'DELETE',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});
