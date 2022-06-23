// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import authenticator from 'authenticator';

import {UserProfile, UserAccessToken} from '@mattermost/types/users';

import {getRandomId} from '../../utils';
import {getAdminAccount, User} from '../env';

import {buildQueryString} from './helpers';
import {ResponseT} from './types';

// *****************************************************************************
// Users
// https://api.mattermost.com/#tag/users
// *****************************************************************************

type UserProfilePassword = UserProfile & {password: string};

import {ChainableT} from './types';

function apiLogin(user: User, requestOptions: Record<string, any> = {}): ChainableT<{user?: UserProfilePassword, error?: any}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/login',
        method: 'POST',
        body: {login_id: user.username || user.email, password: user.password},
        ...requestOptions,
    }).then((response: Cypress.Response<UserProfile | any>) => {
        if (requestOptions.failOnStatusCode) {
            expect(response.status).to.equal(200);
        }

        if (response.status === 200) {
            return {
                user: {
                    ...response.body,
                    password: user.password,
                },
            };
        }

        return {error: response.body};
    });
}
Cypress.Commands.add('apiLogin', apiLogin);

function apiLoginWithMFA(user: User, token: string): ChainableT<{user: UserProfilePassword}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/login',
        method: 'POST',
        body: {login_id: user.username, password: user.password, token},
    }).then((response) => {
        expect(response.status).to.equal(200);
        return {
            user: {
                ...response.body,
                password: user.password,
            },
        };
    });
}
Cypress.Commands.add('apiLoginWithMFA', apiLoginWithMFA);

function apiAdminLogin(requestOptions: Parameters<typeof apiLogin>[1] = {}): ReturnType<typeof apiLogin> {
    const admin = getAdminAccount();

    // First, login with username
    // (compiler thinkgs it is a JQuery<any>)
    // @ts-ignore
    return cy.apiLogin(admin, requestOptions).then((resp) => {
        if (resp.error) {
            if (resp.error.id === 'mfa.validate_token.authenticate.app_error') {
                // On fail, try to login via MFA
                return (cy as any).dbGetUser({username: admin.username}).then(({user: {mfasecret}}) => {
                    const token = authenticator.generateToken(mfasecret);
                    return cy.apiLoginWithMFA(admin, token);
                });
            }

            // Or, try to login via email
            delete admin.username;
            return cy.apiLogin(admin, requestOptions);
        }

        return resp;
    });
}
Cypress.Commands.add('apiAdminLogin', apiAdminLogin);

function apiAdminLoginWithMFA(token: string): ReturnType<typeof apiLoginWithMFA> {
    const admin = getAdminAccount();

    return cy.apiLoginWithMFA(admin, token);

}
Cypress.Commands.add('apiAdminLoginWithMFA', apiAdminLoginWithMFA);

function apiLogout(): void {
    cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/logout',
        method: 'POST',
        log: false,
    });

    // * Verify logged out
    cy.visit('/login?extra=expired').url().should('include', '/login');

    // # Ensure we clear out these specific cookies
    ['MMAUTHTOKEN', 'MMUSERID', 'MMCSRF'].forEach((cookie) => {
        cy.clearCookie(cookie);
    });

    // # Clear remainder of cookies
    cy.clearCookies();
}
Cypress.Commands.add('apiLogout', apiLogout);

function apiGetMe(): ReturnType<typeof apiGetUserById> {
    return cy.apiGetUserById('me');
}
Cypress.Commands.add('apiGetMe', apiGetMe);

function apiGetUserById(userId: string): ChainableT<{user: UserProfile}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/' + userId,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({user: response.body});
    });
}
Cypress.Commands.add('apiGetUserById', apiGetUserById);

function apiGetUserByEmail(email: string, failOnStatusCode = true): ChainableT<{user: UserProfile | null}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/email/' + email,
        failOnStatusCode,
    }).then((response) => {
        const {body, status} = response;

        if (failOnStatusCode) {
            expect(status).to.equal(200);
            return cy.wrap({user: body});
        }
        return cy.wrap({user: status === 200 ? body : null});
    });
}
Cypress.Commands.add('apiGetUserByEmail', apiGetUserByEmail);

function apiGetUsersByUsernames(usernames: string[] = []): ChainableT<{users: UserProfile[]}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/usernames',
        method: 'POST',
        body: usernames,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({users: response.body});
    });
}
Cypress.Commands.add('apiGetUsersByUsernames', apiGetUsersByUsernames)

function apiPatchUser(userId: string, userData: Partial<UserProfile>): ChainableT<{user: UserProfile}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'PUT',
        url: `/api/v4/users/${userId}/patch`,
        body: userData,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({user: response.body});
    });
}
Cypress.Commands.add('apiPatchUser', apiPatchUser)

function apiPatchMe(data: Partial<UserProfile>): ChainableT<{user: UserProfile}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/me/patch',
        method: 'PUT',
        body: data,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({user: response.body});
    });
}
Cypress.Commands.add('apiPatchMe', apiPatchMe);

function apiCreateCustomAdmin({loginAfter = false, hideAdminTrialModal = true}): ChainableT<{sysadmin: UserProfile}> {
    const sysadminUser = generateRandomUser('other-admin');

    // compiler says it is a JQueryAny
    // @ts-ignore
    return cy.apiCreateUser({user: sysadminUser}).then(({user}) => {
        return cy.apiPatchUserRoles(user.id, ['system_admin', 'system_user']).then(() => {
            const data = {sysadmin: user};

            cy.apiSaveStartTrialModal(user.id, hideAdminTrialModal.toString());

            if (loginAfter) {
                return cy.apiLogin(user).then(() => {
                    return data;
                });
            }

            return data;
        });
    });
};
Cypress.Commands.add('apiCreateCustomAdmin', apiCreateCustomAdmin);

function apiCreateAdmin(): ChainableT<{sysadmin: UserProfilePassword}> {
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

        return cy.wrap({sysadmin: {...res.body, password}});
    });
}
Cypress.Commands.add('apiCreateAdmin', apiCreateAdmin);

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

function apiCreateUser({
    prefix = 'user',
    bypassTutorial = true,
    showOnboarding = false,
    hideActionsMenu = true,
    user = null,
} = {}): ChainableT<{user: UserProfilePassword}> {
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

        // // hide the onboarding task list by default so it doesn't block the execution of subsequent tests
        cy.apiSaveSkipStepsPreference(createdUser.id, 'true');
        cy.apiSaveOnboardingTaskListPreference(createdUser.id, 'onboarding_task_list_open', 'false');
        cy.apiSaveOnboardingTaskListPreference(createdUser.id, 'onboarding_task_list_show', 'false');

        if (bypassTutorial) {
            cy.apiSaveTutorialStep(createdUser.id, '999');
        }

        if (showOnboarding) {
            cy.apiSaveSkipStepsPreference(createdUser.id, 'false');
            cy.apiSaveOnboardingTaskListPreference(createdUser.id, 'onboarding_task_list_open', 'false');
            cy.apiSaveOnboardingTaskListPreference(createdUser.id, 'onboarding_task_list_show', 'true');
        }

        if (hideActionsMenu) {
            cy.apiSaveActionsMenuPreference(createdUser.id, true);
        }

        return cy.wrap({user: {...createdUser, password: newUser.password}});
    });
};
Cypress.Commands.add('apiCreateUser', apiCreateUser);

function apiCreateGuestUser({
    prefix = 'guest',
    bypassTutorial = true,
} = {}): ChainableT<{guest: UserProfile}> {
    return cy.apiCreateUser({prefix, bypassTutorial}).then(({user}) => {
        cy.apiDemoteUserToGuest(user.id);

        return cy.wrap({guest: user});
    });
}
Cypress.Commands.add('apiCreateGuestUser', apiCreateGuestUser);

function apiRevokeUserSessions(userId: string): ChainableT<{data: Record<string, any>}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/users/${userId}/sessions/revoke/all`,
        method: 'POST',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({data: response.body});
    });
}
Cypress.Commands.add('apiRevokeUserSessions', apiRevokeUserSessions);

function apiGetUsers(queryParams = {}): ChainableT<{users: UserProfile[]}> {
    const queryString = buildQueryString(queryParams);

    return cy.request({
        method: 'GET',
        url: `/api/v4/users?${queryString}`,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({users: response.body});
    });
}
Cypress.Commands.add('apiGetUsers', apiGetUsers);

interface ApiGetUsersNotInTeamParams {
    teamId?: string;
    page?: number;
    perPage?: number;
}

function apiGetUsersNotInTeam(params: ApiGetUsersNotInTeamParams = {}): ReturnType<typeof apiGetUsers> {
    const {teamId, page = 0, perPage = 60} = params;
    return cy.apiGetUsers({not_in_team: teamId, page, per_page: perPage});
}
Cypress.Commands.add('apiGetUsersNotInTeam', apiGetUsersNotInTeam);

function apiPatchUserRoles(userId: string, roleNames: string[] = ['system_user']): ChainableT<{user: UserProfile}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/users/${userId}/roles`,
        method: 'PUT',
        body: {roles: roleNames.join(' ')},
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({user: response.body});
    });
};
Cypress.Commands.add('apiPatchUserRoles', apiPatchUserRoles);

function apiDeactivateUser(userId: string): ResponseT<any> {
    const options = {
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'DELETE',
        url: `/api/v4/users/${userId}`,
    };

    // # Deactivate a user account
    return cy.request(options).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
}
Cypress.Commands.add('apiDeactivateUser', apiDeactivateUser);

function apiActivateUser(userId: string): ResponseT<any> {
    const options = {
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'PUT',
        url: `/api/v4/users/${userId}/active`,
        body: {
            active: true,
        },
    };

    // # Activate a user account
    return cy.request(options).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
}
Cypress.Commands.add('apiActivateUser', apiActivateUser);

function apiDemoteUserToGuest(userId: string): ChainableT<{guest: UserProfile}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/users/${userId}/demote`,
        method: 'POST',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.apiGetUserById(userId).then(({user}) => {
            return cy.wrap({guest: user});
        });
    });
}
Cypress.Commands.add('apiDemoteUserToGuest', apiDemoteUserToGuest);

function apiPromoteGuestToUser(userId: string): ReturnType<typeof apiGetUserById> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/users/${userId}/promote`,
        method: 'POST',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.apiGetUserById(userId);
    });
}
Cypress.Commands.add('apiPromoteGuestToUser', apiPromoteGuestToUser);

function apiVerifyUserEmailById(userId: string): ChainableT<{user: UserProfile}> {
    const options = {
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'POST',
        url: `/api/v4/users/${userId}/email/verify/member`,
    };

    return cy.request(options).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({user: response.body});
    });
}
Cypress.Commands.add('apiVerifyUserEmailById', apiVerifyUserEmailById);

function apiActivateUserMFA(userId: string, activate: boolean, token: string): ResponseT<any> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/users/${userId}/mfa`,
        method: 'PUT',
        body: {
            activate,
            code: token,
        },
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
}
Cypress.Commands.add('apiActivateUserMFA', apiActivateUserMFA);

function apiResetPassword(userId: string, currentPass: string, newPass: string): ChainableT<{user: UserProfile}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'PUT',
        url: `/api/v4/users/${userId}/password`,
        body: {
            current_password: currentPass,
            new_password: newPass,
        },
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({user: response.body});
    });
}
Cypress.Commands.add('apiResetPassword', apiResetPassword);

function apiGenerateMfaSecret(userId: string): ChainableT<{code: string}>{
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'POST',
        url: `/api/v4/users/${userId}/mfa/generate`,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({code: response.body});
    });
}
Cypress.Commands.add('apiGenerateMfaSecret', apiGenerateMfaSecret);

function apiAccessToken(userId: string, description: string): ResponseT<UserAccessToken> {
    // compiler thinks it is JQuery<any>
    // @ts-ignore
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/' + userId + '/tokens',
        method: 'POST',
        body: {
            description,
        },
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response.body);
    });
}
Cypress.Commands.add('apiAccessToken', apiAccessToken);

function apiRevokeAccessToken(tokenId: string): ResponseT<any> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/tokens/revoke',
        method: 'POST',
        body: {
            token_id: tokenId,
        },
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
}
Cypress.Commands.add('apiRevokeAccessToken', apiRevokeAccessToken);

function apiUpdateUserAuth(userId: string, authData: string, password: string, authService: string): ResponseT<any> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'PUT',
        url: `/api/v4/users/${userId}/auth`,
        body: {
            auth_data: authData,
            password,
            auth_service: authService,
        },
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
}
Cypress.Commands.add('apiUpdateUserAuth', apiUpdateUserAuth);

function apiGetTotalUsers(): ChainableT<number> {
    // compiler thinks it is a JQuery<any>
    // @ts-ignore
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'GET',
        url: '/api/v4/users/stats',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response.body.total_users_count);
    });
}
Cypress.Commands.add('apiGetTotalUsers', apiGetTotalUsers);

export {generateRandomUser};

declare global {
    namespace Cypress {
        interface Chainable {

            /**
             * Login to server via API.
             * See https://api.mattermost.com/#tag/users/paths/~1users~1login/post
             * @param {string} user.username - username of a user
             * @param {string} user.password - password of  user
             * @param {string} user.email - email of  user
             *
             * @example
             *   cy.apiLogin({username: 'sysadmin', password: 'secret': email: 'example@website.com'});
             */
            apiLogin: typeof apiLogin;

            /**
             * Login to server via API.
             * See https://api.mattermost.com/#tag/users/paths/~1users~1login/post
             * @param {string} user.username - username of a user
             * @param {string} user.password - password of  user
             * @param {string} token - MFA token for the session
             * @returns {UserProfilePassword} out.user: `UserProfilePassword` object
             *
             * @example
             *   cy.apiLoginWithMFA({username: 'sysadmin', password: 'secret', token: '123456'});
             */
            apiLoginWithMFA: typeof apiLoginWithMFA;

            /**
             * Login as admin via API.
             * See https://api.mattermost.com/#tag/users/paths/~1users~1login/post
             * @returns {UserProfile} out.user: `UserProfile` object
             *
             * @example
             *   cy.apiAdminLogin();
             */
            apiAdminLogin: typeof apiAdminLogin;

            /**
             * Login as admin via API.
             * See https://api.mattermost.com/#tag/users/paths/~1users~1login/post
             * @param {string} token - MFA token for the session
             * @returns {UserProfile} out.user: `UserProfile` object
             *
             * @example
             *   cy.apiAdminLoginWithMFA(token);
             */
            apiAdminLoginWithMFA: typeof apiAdminLoginWithMFA;

            /**
             * Logout a user's active session from server via API.
             * See https://api.mattermost.com/#tag/users/paths/~1users~1logout/post
             * Clears all cookies especially `MMAUTHTOKEN`, `MMUSERID` and `MMCSRF`.
             *
             * @example
             *   cy.apiLogout();
             */
            apiLogout: typeof apiLogout;

            /**
             * Get current user.
             * See https://api.mattermost.com/#tag/users/paths/~1users~1{user_id}/get
             * @returns {UserProfile} out.user: `UserProfile` object
             *
             * @example
             *   cy.apiGetMe().then(({user}) => {
             *       // do something with user
             *   });
             */
            apiGetMe(): Chainable<UserProfile>;

            /**
             * Get a user by ID.
             * See https://api.mattermost.com/#tag/users/paths/~1users~1{user_id}/get
             * @param {String} userId - ID of a user to get profile
             * @returns {UserProfile} out.user: `UserProfile` object
             *
             * @example
             *   cy.apiGetUserById('user-id').then(({user}) => {
             *       // do something with user
             *   });
             */
            apiGetUserById: typeof apiGetUserById;

            /**
             * Get a user by email.
             * See https://api.mattermost.com/#tag/users/paths/~1users~1email~1{email}/get
             * @param {String} email - email address of a user to get profile
             * @returns {UserProfile} out.user: `UserProfile` object or null
             *
             * @example
             *   cy.apiGetUserByEmail('email').then(({user}) => {
             *       // do something with user
             *   });
             */
            apiGetUserByEmail: typeof apiGetUserByEmail;

            /**
             * Get users by usernames.
             * See https://api.mattermost.com/#tag/users/paths/~1users~1usernames/post
             * @param {String[]} usernames - list of usernames to get profiles
             * @returns {UserProfile[]} out.users: list of `UserProfile` objects
             *
             * @example
             *   cy.apiGetUsersByUsernames().then(({users}) => {
             *       // do something with users
             *   });
             */
            apiGetUsersByUsernames: typeof apiGetUsersByUsernames;

            /**
             * Patch a user.
             * See https://api.mattermost.com/#tag/users/paths/~1users~1{user_id}~1patch/put
             * @param {String} userId - ID of user to patch
             * @param {UserProfile} userData - user profile to be updated
             * @param {string} userData.email
             * @param {string} userData.username
             * @param {string} userData.first_name
             * @param {string} userData.last_name
             * @param {string} userData.nickname
             * @param {string} userData.locale
             * @param {Object} userData.timezone
             * @param {string} userData.position
             * @param {Object} userData.props
             * @param {Object} userData.notify_props
             * @returns {UserProfile} out.user: `UserProfile` object
             *
             * @example
             *   cy.apiPatchUser('user-id', {locale: 'en'}).then(({user}) => {
             *       // do something with user
             *   });
             */
            apiPatchUser: typeof apiPatchUser;

            /**
             * Convenient command to patch a current user.
             * See https://api.mattermost.com/#tag/users/paths/~1users~1{user_id}~1patch/put
             * @param {UserProfile} userData - user profile to be updated
             * @param {string} userData.email
             * @param {string} userData.username
             * @param {string} userData.first_name
             * @param {string} userData.last_name
             * @param {string} userData.nickname
             * @param {string} userData.locale
             * @param {Object} userData.timezone
             * @param {string} userData.position
             * @param {Object} userData.props
             * @param {Object} userData.notify_props
             * @returns {UserProfile} out.user: `UserProfile` object
             *
             * @example
             *   cy.apiPatchMe({locale: 'en'}).then(({user}) => {
             *       // do something with user
             *   });
             */
            apiPatchMe: typeof apiPatchMe;

            /**
             * Create an admin account based from the env variables defined in Cypress env.
             * @param {string} options.namePrefix - 'user' (default) or any prefix to easily identify a user
             * @param {boolean} options.bypassTutorial - true (default) or false for user to go thru tutorial steps
             * @param {boolean} options.showOnboarding - false (default) to hide or true to show Onboarding steps
             * @returns {UserProfilePassword} `out.sysadmin` as `UserProfilePassword` object
             *
             * @example
             *   cy.apiCreateAdmin(options);
             */
            apiCreateAdmin: typeof apiCreateAdmin;

            /**
             * Create a randomly named admin account
             *
             * @param {boolean} options.loginAfter - false (default) or true if wants to login as the new admin.
             * @param {boolean} options.hideAdminTrialModal - true (default) or false if wants to hide Start Enterprise Trial modal.
             *
             * @returns {UserProfile} `out.sysadmin` as `UserProfile` object
             */
            apiCreateCustomAdmin: typeof apiCreateCustomAdmin;

            /**
             * Create a new user with an options to set name prefix and be able to bypass tutorial steps.
             * @param {string} options.user - predefined `user` object instead on random user
             * @param {string} options.prefix - 'user' (default) or any prefix to easily identify a user
             * @param {boolean} options.bypassTutorial - true (default) or false for user to go thru tutorial steps
             * @param {boolean} options.showOnboarding - false (default) to hide or true to show Onboarding steps
             * @returns {UserProfilePassword} `out.user` as `UserProfilePassword` object
             *
             * @example
             *   cy.apiCreateUser(options);
             */
            apiCreateUser: typeof apiCreateUser

            /**
             * Create a new guest user with an options to set name prefix and be able to bypass tutorial steps.
             * @param {string} options.prefix - 'guest' (default) or any prefix to easily identify a guest
             * @param {boolean} options.bypassTutorial - true (default) or false for guest to go thru tutorial steps
             * @param {boolean} options.showOnboarding - false (default) to hide or true to show Onboarding steps
             * @returns {UserProfile} `out.guest` as `UserProfile` object
             *
             * @example
             *   cy.apiCreateGuestUser(options);
             */
            apiCreateGuestUser: typeof apiCreateGuestUser;

            /**
             * Revoke all active sessions for a user.
             * See https://api.mattermost.com/#tag/users/paths/~1users~1{user_id}~1sessions~1revoke~1all/post
             * @param {String} userId - ID of a user
             * @returns {Object} `out.data` as response status
             *
             * @example
             *   cy.apiRevokeUserSessions('user-id');
             */
            apiRevokeUserSessions: typeof apiRevokeUserSessions;

            /**
             * Get list of users based on query parameters
             * See https://api.mattermost.com/#tag/users/paths/~1users/get
             * @param {String} queryParams - see link on available query parameters
             * @returns {UserProfile[]} `out.users` as `UserProfile[]` object
             *
             * @example
             *   cy.apiGetUsers().then(({users}) => {
             *       // do something with users
             *   });
             */
            apiGetUsers: typeof apiGetUsers;

            /**
             * Get list of users that are not team members.
             * See https://api.mattermost.com/#tag/users/paths/~1users/get
             * @param {String} queryParams.teamId - Team ID
             * @param {String} queryParams.page - Page to select, 0 (default)
             * @param {String} queryParams.perPage - The number of users per page, 60 (default)
             * @returns {UserProfile[]} `out.users` as `UserProfile[]` object
             *
             * @example
             *   cy.apiGetUsersNotInTeam({teamId: 'team-id'}).then(({users}) => {
             *       // do something with users
             *   });
             */
            apiGetUsersNotInTeam: typeof apiGetUsersNotInTeam;

            /**
             * Reactivate a user account.
             * @param {string} userId - User ID
             * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
             *
             * @example
             *   cy.apiActivateUser('user-id');
             */
            apiActivateUser: typeof apiActivateUser;

            /**
             * Deactivate a user account.
             * See https://api.mattermost.com/#tag/users/paths/~1users~1{user_id}/delete
             * @param {string} userId - User ID
             * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
             *
             * @example
             *   cy.apiDeactivateUser('user-id');
             */
            apiDeactivateUser: typeof apiDeactivateUser;

            /**
             * Convert a regular user into a guest. This will convert the user into a guest for the whole system while retaining their existing team and channel memberships.
             * See https://api.mattermost.com/#tag/users/paths/~1users~1{user_id}~1demote/post
             * @param {string} userId - User ID
             * @returns {UserProfile} out.user: `UserProfile` object
             *
             * @example
             *   cy.apiDemoteUserToGuest('user-id');
             */
            apiDemoteUserToGuest: typeof apiDemoteUserToGuest;

            /**
             * Convert a guest into a regular user. This will convert the guest into a user for the whole system while retaining any team and channel memberships and automatically joining them to the default channels.
             * See https://api.mattermost.com/#tag/users/paths/~1users~1{user_id}~1promote/post
             * @param {string} userId - User ID
             * @returns {UserProfile} out.user: `UserProfile` object
             *
             * @example
             *   cy.apiPromoteGuestToUser('user-id');
             */
            apiPromoteGuestToUser: typeof apiPromoteGuestToUser;

            /**
             * Verifies a user's email via userId without having to go to the user's email inbox.
             * See https://api.mattermost.com/#tag/users/paths/~1users~1{user_id}~1email~1verify~1member/post
             * @param {string} userId - User ID
             * @returns {UserProfile} out.user: `UserProfile` object
             *
             * @example
             *   cy.apiVerifyUserEmailById('user-id').then(({user}) => {
             *       // do something with user
             *   });
             */
            apiVerifyUserEmailById(userId: string): Chainable<UserProfile>;

            /**
             * Update a user MFA.
             * See https://api.mattermost.com/#tag/users/paths/~1users~1{user_id}~1mfa/put
             * @param {String} userId - ID of user to patch
             * @param {boolean} activate - Whether MFA is going to be enabled or disabled
             * @param {string} token - MFA token/code
             * @example
             *   cy.apiActivateUserMFA('user-id', activate: false);
             */
            apiActivateUserMFA: typeof apiActivateUserMFA;

            /**
             * Create a user access token
             * See https://api.mattermost.com/#tag/users/paths/~1users~1{user_id}~1tokens/post
             * @param {String} userId - ID of user for whom to generate token
             * @param {String} description - The description of the token usage
             * @example
             *   cy.apiAccessToken('user-id', 'token for cypress tests');
             */
            apiAccessToken: typeof apiAccessToken;

            /**
             * Revoke a user access token
             * See https://api.mattermost.com/#tag/users/paths/~1users~1tokens~1revoke/post
             * @param {String} tokenId - The id of the token to revoke
             * @example
             *   cy.apiRevokeAccessToken('token-id')
             */
            apiRevokeAccessToken: typeof apiRevokeAccessToken;

            /**
             * Update a user auth method.
             * See https://api.mattermost.com/#tag/users/paths/~1users~1{user_id}~1mfa/put
             * @param {String} userId - ID of user to patch
             * @param {String} authData
             * @param {String} password
             * @param {String} authService
             * @example
             *   cy.apiUpdateUserAuth('user-id', 'auth-data', 'password', 'auth-service');
             */
            apiUpdateUserAuth: typeof apiUpdateUserAuth;

            /**
             * Get total count of users in the system
             * See https://api.mattermost.com/#operation/GetTotalUsersStats
             *
             * @returns {number} - total count of all users
             *
             * @example
             *   cy.apiGetTotalUsers().then((totalUsers) => {
             *      // do something with total users
             *   });
             */
            apiGetTotalUsers: typeof apiGetTotalUsers;

            /* Modify a user's roles
             * @example
             *   cy.apiPatchUserRoles('user-id', ['system_admin', 'system_user']).then(() => {
             *      // do something with user
             *   });
             */
            apiPatchUserRoles: typeof apiPatchUserRoles;

            /**
             * Reset a user's password
             *
             * @example
             *  cy.apiResetPassword('userId', 'password1', 'password2');
             */
            apiResetPassword: typeof apiResetPassword;
            
            /**
             * Generate a MFA secret
             *
             * @example
             *  cy.apiGenerateMfaSecret('userId').then(({code}) => {
             *    // do something with mfa secret code
             *  });
             */
            apiGenerateMfaSecret: typeof apiGenerateMfaSecret;
        }
    }
}
