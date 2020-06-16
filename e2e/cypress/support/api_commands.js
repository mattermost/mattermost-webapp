// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import merge from 'merge-deep';

import {getRandomId} from '../utils';

import users from '../fixtures/users.json';
import partialDefaultConfig from '../fixtures/partial_default_config.json';

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

Cypress.Commands.add('apiLogin', (username = 'user-1', password = null) => {
    cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/login',
        method: 'POST',
        body: {login_id: username, password: password || users[username].password},
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

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

// *******************************************************************************
// Bots
// https://api.mattermost.com/#tag/bots
// *******************************************************************************

Cypress.Commands.add('apiGetBots', () => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/bots',
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

// *****************************************************************************
// Channels
// https://api.mattermost.com/#tag/channels
// *****************************************************************************

Cypress.Commands.add('apiCreateChannel', (teamId, name, displayName, type = 'O', purpose = '', header = '') => {
    const uniqueName = `${name}-${getRandomId()}`;

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

Cypress.Commands.add('apiCreateDirectChannel', (userids) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/channels/direct',
        method: 'POST',
        body: userids,
    }).then((response) => {
        expect(response.status).to.equal(201);
        return cy.wrap(response);
    });
});

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
// Email
// *****************************************************************************

/**
 * Test SMTP setup
 */
Cypress.Commands.add('apiEmailTest', () => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/email/test',
        method: 'POST',
    }).then((response) => {
        expect(response.status, 'SMTP not setup at sysadmin config').to.equal(200);
        cy.wrap(response);
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
    const uniqueName = `${name}-${getRandomId()}`;

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
 * Get a team based on provided name string
 * @param {String} name - name of a team
 */
Cypress.Commands.add('apiGetTeamByName', (name) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/teams/name/' + name,
        method: 'GET',
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

Cypress.Commands.add('apiCreateNewUser', (user = {}, teamIds = [], bypassTutorial = true) => {
    const randomId = getRandomId();

    const {
        email = `user${randomId}@sample.mattermost.com`,
        username = `user${randomId}`,
        firstName = `First${randomId}`,
        lastName = `Last${randomId}`,
        nickname = `NewE2ENickname${randomId}`,
        password = 'password123'} = user;

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
Cypress.Commands.add('apiCreateAndLoginAsNewUser', (user = {}, teamIds = [], bypassTutorial = true) => {
    return cy.apiCreateNewUser(user, teamIds, bypassTutorial).then((newUser) => {
        return cy.apiLogin(newUser.username, newUser.password).then((response) => {
            expect(response.status).to.equal(200);

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

const getDefaultConfig = () => {
    const fromCypressEnv = {
        LdapSettings: {
            LdapServer: Cypress.env('ldapServer'),
            LdapPort: Cypress.env('ldapPort'),
        },
    };

    return merge(partialDefaultConfig, fromCypressEnv);
};

Cypress.Commands.add('apiUpdateConfig', (newSettings = {}) => {
    // # Get current settings
    return cy.request('/api/v4/config').then((response) => {
        const oldSettings = response.body;

        const settings = merge(oldSettings, getDefaultConfig(), newSettings);

        // # Set the modified settings
        return cy.request({
            url: '/api/v4/config',
            headers: {'X-Requested-With': 'XMLHttpRequest'},
            method: 'PUT',
            body: settings,
        }).then((updateResponse) => {
            expect(updateResponse.status).to.equal(200);
            cy.wrap(response);
        });
    });
});

Cypress.Commands.add('apiGetConfig', () => {
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

/**
 * Invalidate all the caches
 */
Cypress.Commands.add('apiInvalidateCache', () => {
    return cy.request({
        url: '/api/v4/caches/invalidate',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'POST',
    }).then((response) => {
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
    // # Create a New Team for Guest User
    return cy.apiCreateTeam('guest-team', 'Guest Team').then((createResponse) => {
        const team = createResponse.body;
        cy.getCookie('MMUSERID').then((cookie) => {
            // #Assign Sysadmin user to the newly created team
            cy.apiAddUserToTeam(team.id, cookie.value);
        });

        // #Create New User
        return cy.apiCreateNewUser(user, [team.id], bypassTutorial).then((newUser) => {
            // # Demote Regular Member to Guest User
            cy.demoteUser(newUser.id);
            cy.apiLogin(newUser.username, newUser.password).then(() => {
                return cy.wrap({user: newUser, team});
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
Cypress.Commands.add('apiInstallPluginFromUrl', (pluginDownloadUrl, force = false) => {
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
 * Remove the plugin with the provided ID from the server. All plugin files are deleted.
 *
 * @param {String} pluginId - Id of the plugin to uninstall
 */
Cypress.Commands.add('apiRemovePluginById', (pluginId) => {
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
Cypress.Commands.add('apiGetAllPlugins', () => {
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
Cypress.Commands.add('apiEnablePluginById', (pluginId) => {
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
 * @param {String} filename - name of the plugin to upload
 */
Cypress.Commands.add('apiUploadPlugin', (filename) => {
    cy.apiUploadFile('plugin', filename, {url: '/api/v4/plugins', method: 'POST', successStatus: 201});
});

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
 * Activate/Deactivate a User directly via API
 * @param {String} userId - The user ID
 * @param {Boolean} active - Whether to activate or deactivate - true/false
 */
Cypress.Commands.add('apiActivateUser', (userId, active = true) => {
    const baseUrl = Cypress.config('baseUrl');
    cy.externalRequest({user: users.sysadmin, method: 'put', baseUrl, path: `users/${userId}/active`, data: {active}});
});

// *****************************************************************************
// Groups
// https://api.mattermost.com/#tag/groups
// *****************************************************************************

/**
 * Get all groups via the API
 *
 * @param {Integer} page - The desired page of the paginated list
 * @param {Integer} perPage - The number of groups per page
 *
 */
Cypress.Commands.add('apiGetGroups', (page = 0, perPage = 100) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/groups?page=${page}&per_page=${perPage}`,
        method: 'GET',
        timeout: 60000,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Get LDAP groups
 *
 * @param {Integer} page - The desired page of the paginated list
 * @param {Integer} perPage - The number of groups per page
 *
 */
Cypress.Commands.add('apiGetLDAPGroups', (page = 0, perPage = 100) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/ldap/groups?page=${page}&per_page=${perPage}`,
        method: 'GET',
        timeout: 60000,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Patch a group directly via API
 *
 * @param {String} name - The new name for the group
 * @param {Object} patch
 *   {Boolean} allow_reference - Whether to allow reference (group mention) or not  - true/false
 *   {String} name - Name for the group, used for group mentions
 *   {String} display_name - Display name for the group
 *   {String} description - Description for the group
 *
 */
Cypress.Commands.add('apiPatchGroup', (groupID, patch) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/groups/${groupID}/patch`,
        method: 'PUT',
        timeout: 60000,
        body: patch,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Get all LDAP groups via API
 * @param {Integer} page - The page to select
 * @param {Integer} perPage - The number of groups per page
 */
Cypress.Commands.add('apiGetLDAPGroups', (page = 0, perPage = 100) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/ldap/groups?page=${page}&per_page=${perPage}`,
        method: 'GET',
        timeout: 60000,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Add a link for LDAP group via API
 * @param {String} remoteId - remote ID of the group
 */
Cypress.Commands.add('apiAddLDAPGroupLink', (remoteId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/ldap/groups/${remoteId}/link`,
        method: 'POST',
        timeout: 60000,
    }).then((response) => {
        return cy.wrap(response);
    });
});

/**
 * Retrieve the list of groups associated with a given team via API
 * @param {String} teamId - Team GUID
 */
Cypress.Commands.add('apiGetTeamGroups', (teamId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/teams/${teamId}/groups`,
        method: 'GET',
        timeout: 60000,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Delete a link from a team to a group via API
 * @param {String} groupId - Group GUID
 * @param {String} teamId - Team GUID
 */
Cypress.Commands.add('apiDeleteLinkFromTeamToGroup', (groupId, teamId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/groups/${groupId}/teams/${teamId}/link`,
        method: 'DELETE',
        timeout: 60000,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

Cypress.Commands.add('apiLinkGroup', (groupID) => {
    return linkUnlinkGroup(groupID, 'POST');
});

Cypress.Commands.add('apiUnlinkGroup', (groupID) => {
    return linkUnlinkGroup(groupID, 'DELETE');
});

function linkUnlinkGroup(groupID, httpMethod) {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/ldap/groups/${groupID}/link`,
        method: httpMethod,
        timeout: 60000,
    }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 204]);
        return cy.wrap(response);
    });
}

Cypress.Commands.add('apiGetGroupTeams', (groupID) => {
    return getGroupSyncables(groupID, 'team');
});

Cypress.Commands.add('apiGetGroupTeam', (groupID, teamID) => {
    return getGroupSyncable(groupID, 'team', teamID);
});

Cypress.Commands.add('apiGetGroupChannels', (groupID) => {
    return getGroupSyncables(groupID, 'channel');
});

Cypress.Commands.add('apiGetGroupChannel', (groupID, channelID) => {
    return getGroupSyncable(groupID, 'channel', channelID);
});

function getGroupSyncable(groupID, syncableType, syncableID) {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/groups/${groupID}/${syncableType}s/${syncableID}`,
        method: 'GET',
        timeout: 60000,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
}

function getGroupSyncables(groupID, syncableType) {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/groups/${groupID}/${syncableType}s?page=0&per_page=100`,
        method: 'GET',
        timeout: 60000,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
}

Cypress.Commands.add('apiUnlinkGroupTeam', (groupID, teamID) => {
    return linkUnlinkGroupSyncable(groupID, teamID, 'team', 'DELETE');
});

Cypress.Commands.add('apiLinkGroupTeam', (groupID, teamID) => {
    return linkUnlinkGroupSyncable(groupID, teamID, 'team', 'POST');
});

Cypress.Commands.add('apiUnlinkGroupChannel', (groupID, channelID) => {
    return linkUnlinkGroupSyncable(groupID, channelID, 'channel', 'DELETE');
});

Cypress.Commands.add('apiLinkGroupChannel', (groupID, channelID) => {
    return linkUnlinkGroupSyncable(groupID, channelID, 'channel', 'POST');
});

function linkUnlinkGroupSyncable(groupID, syncableID, syncableType, httpMethod) {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/groups/${groupID}/${syncableType}s/${syncableID}/link`,
        method: httpMethod,
        timeout: 60000,
        body: {auto_add: true},
    }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 204]);
        return cy.wrap(response);
    });
}

// *****************************************************************************
// SAML
// https://api.mattermost.com/#tag/SAML
// *****************************************************************************

/**
 * Get SAML certificate status directly via API.
 */
Cypress.Commands.add('apiGetSAMLCertificateStatus', () => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/saml/certificate/status',
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Get metadata from Identity Provider directly via API.
 *
 * @param {String} samlMetadataUrl
 */
Cypress.Commands.add('apiGetMetadataFromIdp', (samlMetadataUrl) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/saml/metadatafromidp',
        method: 'POST',
        body: {saml_metadata_url: samlMetadataUrl},
    }).then((response) => {
        expect(response.status, 'Failed to obtain metadata from Identity Provider URL').to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Upload SAML IDP certificate directly via API
 * @param {String} filename
 */
Cypress.Commands.add('apiUploadSAMLIDPCert', (filename) => {
    cy.apiUploadFile('certificate', filename, {url: '/api/v4/saml/certificate/idp', method: 'POST', successStatus: 201});
});

/**
 * Upload SAML public certificate directly via API
 * @param {String} filename
 */
Cypress.Commands.add('apiUploadSAMLPublicCert', (filename) => {
    cy.apiUploadFile('certificate', filename, {url: '/api/v4/saml/certificate/public', method: 'POST', successStatus: 200});
});

/**
 * Upload SAML private Key directly via API
 * @param {String} filename
 */
Cypress.Commands.add('apiUploadSAMLPrivateKey', (filename) => {
    cy.apiUploadFile('certificate', filename, {url: '/api/v4/saml/certificate/private', method: 'POST', successStatus: 200});
});

// *****************************************************************************
// Common / Helper commands
// *****************************************************************************

/**
 * Upload file directly via API
 * @param {String} name - name of form
 * @param {String} filename - name of a file to upload
 * @param {Object} options - request options
 * @param {String} options.url
 * @param {String} options.method
 * @param {Number} options.successStatus
 */
Cypress.Commands.add('apiUploadFile', (name, filename, options = {}) => {
    const formData = new FormData();

    cy.fixture(filename, 'binary', {timeout: 1200000}).
        then(Cypress.Blob.binaryStringToBlob).
        then((blob) => {
            formData.set(name, blob, filename);
            formRequest(options.method, options.url, formData, options.successStatus);
        });
});

/**
 * process binary file HTTP form request
 * @param {String} method - Http request method - POST/PUT
 * @param {String} url - HTTP resource URL
 * @param {FormData} FormData - Key value pairs representing form fields and value
 */
function formRequest(method, url, formData, successStatus) {
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
                expect(xhr.status, 'Expected form request to be processed successfully').to.equal(successStatus);
            } else {
                expect(xhr.status, 'Form request process delayed').to.equal(successStatus);
            }
        });
    });
}
