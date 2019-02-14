// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getChannelAndMyMember, getChannelMembersByIds} from 'mattermost-redux/actions/channels';
import {deletePreferences as deletePreferencesRedux, savePreferences as savePreferencesRedux} from 'mattermost-redux/actions/preferences';
import {getTeamMembersByIds} from 'mattermost-redux/actions/teams';
import * as UserActions from 'mattermost-redux/actions/users';
import {Client4} from 'mattermost-redux/client';
import {Preferences as PreferencesRedux} from 'mattermost-redux/constants';
import {
    getChannel,
    getCurrentChannelId,
    getMyChannels,
    getMyChannelMember,
    getChannelMembersInChannels,
} from 'mattermost-redux/selectors/entities/channels';
import {getBool, makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeamId, getTeamMember} from 'mattermost-redux/selectors/entities/teams';
import * as Selectors from 'mattermost-redux/selectors/entities/users';

import {browserHistory} from 'utils/browser_history';
import {loadStatusesForProfilesList, loadStatusesForProfilesMap} from 'actions/status_actions.jsx';
import store from 'stores/redux_store.jsx';
import * as Utils from 'utils/utils.jsx';
import {Constants, Preferences, UserStatuses} from 'utils/constants.jsx';

const dispatch = store.dispatch;
const getState = store.getState;

export async function switchFromLdapToEmail(email, password, token, ldapPassword, success, error) {
    const {data, error: err} = await UserActions.switchLdapToEmail(ldapPassword, email, password, token)(dispatch, getState);

    if (data) {
        if (success) {
            success(data);
        }
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export function loadProfilesAndTeamMembers(page, perPage, teamId) {
    return async (doDispatch, doGetState) => {
        const newTeamId = teamId || getCurrentTeamId(doGetState());
        const {data} = await doDispatch(UserActions.getProfilesInTeam(newTeamId, page, perPage));
        if (data) {
            doDispatch(loadTeamMembersForProfilesList(data, newTeamId));
            doDispatch(loadStatusesForProfilesList(data));
        }

        return {data: true};
    };
}

export function loadProfilesAndTeamMembersAndChannelMembers(page, perPage, teamId, channelId) {
    return async (doDispatch, doGetState) => {
        const state = doGetState();
        const teamIdParam = teamId || getCurrentTeamId(state);
        const channelIdParam = channelId || getCurrentChannelId(state);
        const {data} = await doDispatch(UserActions.getProfilesInChannel(channelIdParam, page, perPage));
        if (data) {
            const {data: listData} = await doDispatch(loadTeamMembersForProfilesList(data, teamIdParam));
            if (listData) {
                doDispatch(loadChannelMembersForProfilesList(data, channelIdParam));
                doDispatch(loadStatusesForProfilesList(data));
            }
        }

        return {data: true};
    };
}

export function loadTeamMembersForProfilesList(profiles, teamId) {
    return async (doDispatch, doGetState) => {
        const state = doGetState();
        const teamIdParam = teamId || getCurrentTeamId(state);
        const membersToLoad = {};
        for (let i = 0; i < profiles.length; i++) {
            const pid = profiles[i].id;

            if (!getTeamMember(state, teamIdParam, pid)) {
                membersToLoad[pid] = true;
            }
        }

        const userIdsToLoad = Object.keys(membersToLoad);
        if (userIdsToLoad.length === 0) {
            return {data: true};
        }

        await doDispatch(getTeamMembersByIds(teamIdParam, userIdsToLoad));

        return {data: true};
    };
}

export async function loadProfilesWithoutTeam(page, perPage, success) {
    const {data} = await UserActions.getProfilesWithoutTeam(page, perPage)(dispatch, getState);
    dispatch(loadStatusesForProfilesMap(data));

    if (success) {
        success(data);
    }
}

export function loadTeamMembersAndChannelMembersForProfilesList(profiles, teamId, channelId) {
    return async (doDispatch, doGetState) => {
        const state = doGetState();
        const teamIdParam = teamId || getCurrentTeamId(state);
        const channelIdParam = channelId || getCurrentChannelId(state);
        const {data} = await doDispatch(loadTeamMembersForProfilesList(profiles, teamIdParam));
        if (data) {
            doDispatch(loadChannelMembersForProfilesList(profiles, channelIdParam));
        }

        return {data: true};
    };
}

export function loadChannelMembersForProfilesList(profiles, channelId) {
    return async (doDispatch, doGetState) => {
        const state = doGetState();
        const channelIdParam = channelId || getCurrentChannelId(state);
        const membersToLoad = {};
        for (let i = 0; i < profiles.length; i++) {
            const pid = profiles[i].id;

            const members = getChannelMembersInChannels(state)[channelIdParam];
            if (!members || !members[pid]) {
                membersToLoad[pid] = true;
            }
        }

        const list = Object.keys(membersToLoad);
        if (list.length === 0) {
            return {data: true};
        }

        await doDispatch(getChannelMembersByIds(channelIdParam, list));
        return {data: true};
    };
}

export async function loadNewDMIfNeeded(channelId) {
    function checkPreference(channel) {
        const userId = Utils.getUserIdFromChannelName(channel);

        if (!userId) {
            return;
        }

        const pref = getBool(getState(), Preferences.CATEGORY_DIRECT_CHANNEL_SHOW, userId, false);
        if (pref === false) {
            const now = Utils.getTimestamp();
            const currentUserId = Selectors.getCurrentUserId(getState());
            savePreferencesRedux(currentUserId, [
                {user_id: currentUserId, category: Preferences.CATEGORY_DIRECT_CHANNEL_SHOW, name: userId, value: 'true'},
                {user_id: currentUserId, category: Preferences.CATEGORY_CHANNEL_OPEN_TIME, name: channelId, value: now.toString()},
            ])(dispatch, getState);
            loadProfilesForDM();
        }
    }

    const channel = getChannel(getState(), channelId);
    if (channel) {
        checkPreference(channel);
    } else {
        const {data} = await getChannelAndMyMember(channelId)(dispatch, getState);
        if (data) {
            checkPreference(data.channel);
        }
    }
}

export async function loadNewGMIfNeeded(channelId) {
    function checkPreference() {
        const pref = getBool(getState(), Preferences.CATEGORY_GROUP_CHANNEL_SHOW, channelId, false);
        if (pref === false) {
            const currentUserId = Selectors.getCurrentUserId(getState());
            savePreferencesRedux(currentUserId, [{user_id: currentUserId, category: Preferences.CATEGORY_GROUP_CHANNEL_SHOW, name: channelId, value: 'true'}])(dispatch, getState);
            loadProfilesForGM();
        }
    }

    const channel = getChannel(getState(), channelId);
    if (!channel) {
        await getChannelAndMyMember(channelId)(dispatch, getState);
    }
    checkPreference();
}

export function loadProfilesForSidebar() {
    loadProfilesForDM();
    loadProfilesForGM();
}

export async function loadProfilesForGM() {
    const state = getState();
    const channels = getMyChannels(state);
    const newPreferences = [];
    const userIdsInChannels = Selectors.getUserIdsInChannels(state);
    const currentUserId = Selectors.getCurrentUserId(state);

    for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        if (channel.type !== Constants.GM_CHANNEL) {
            continue;
        }

        const userIds = userIdsInChannels[channel.id] || new Set();
        if (userIds.size >= Constants.MIN_USERS_IN_GM) {
            continue;
        }

        const isVisible = getBool(state, Preferences.CATEGORY_GROUP_CHANNEL_SHOW, channel.id);

        if (!isVisible) {
            const member = getMyChannelMember(state, channel.id);
            if (!member || (member.mention_count === 0 && member.msg_count >= channel.total_msg_count)) {
                continue;
            }

            newPreferences.push({
                user_id: currentUserId,
                category: Preferences.CATEGORY_GROUP_CHANNEL_SHOW,
                name: channel.id,
                value: 'true',
            });
        }

        await dispatch(UserActions.getProfilesInChannel(channel.id, 0, Constants.MAX_USERS_IN_GM)); //eslint-disable-line no-await-in-loop
    }

    if (newPreferences.length > 0) {
        savePreferencesRedux(currentUserId, newPreferences)(dispatch, getState);
    }
}

export async function loadProfilesForDM() {
    const state = getState();
    const channels = getMyChannels(state);
    const newPreferences = [];
    const profilesToLoad = [];
    const profileIds = [];
    const currentUserId = Selectors.getCurrentUserId(state);

    for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        if (channel.type !== Constants.DM_CHANNEL) {
            continue;
        }

        const teammateId = channel.name.replace(currentUserId, '').replace('__', '');
        const isVisible = getBool(state, Preferences.CATEGORY_DIRECT_CHANNEL_SHOW, teammateId);

        if (!isVisible) {
            const member = getMyChannelMember(state, channel.id);
            if (!member || member.mention_count === 0) {
                continue;
            }

            newPreferences.push({
                user_id: currentUserId,
                category: Preferences.CATEGORY_DIRECT_CHANNEL_SHOW,
                name: teammateId,
                value: 'true',
            });
        }

        if (!Selectors.getUser(state, teammateId)) {
            profilesToLoad.push(teammateId);
        }
        profileIds.push(teammateId);
    }

    if (newPreferences.length > 0) {
        savePreferencesRedux(currentUserId, newPreferences)(dispatch, getState);
    }

    if (profilesToLoad.length > 0) {
        await UserActions.getProfilesByIds(profilesToLoad)(dispatch, getState);
    }
}

export function saveTheme(teamId, theme) {
    return async (doDispatch, doGetState) => {
        const currentUserId = Selectors.getCurrentUserId(doGetState());
        const preference = [{
            user_id: currentUserId,
            category: Preferences.CATEGORY_THEME,
            name: teamId,
            value: JSON.stringify(theme),
        }];

        await doDispatch(savePreferencesRedux(currentUserId, preference));
        return doDispatch(onThemeSaved(teamId));
    };
}

function onThemeSaved(teamId) {
    return async (doDispatch, doGetState) => {
        const getCategory = makeGetCategory();
        const state = doGetState();
        const themePreferences = getCategory(state, Preferences.CATEGORY_THEME);

        if (teamId !== '' && themePreferences.length > 1) {
            // no extra handling to be done to delete team-specific themes
            return;
        }

        const currentUserId = Selectors.getCurrentUserId(state);
        const toDelete = [];

        for (const themePreference of themePreferences) {
            const name = themePreference.name;
            if (name === '' || name === teamId) {
                continue;
            }

            toDelete.push({
                user_id: currentUserId,
                category: Preferences.CATEGORY_THEME,
                name,
            });
        }

        if (toDelete.length > 0) {
            // we're saving a new global theme so delete any team-specific ones
            doDispatch(deletePreferencesRedux(currentUserId, toDelete));
        }
    };
}

export async function searchUsers(term, teamId = getCurrentTeamId(getState()), options = {}, success) {
    const {data} = await UserActions.searchProfiles(term, {team_id: teamId, ...options})(dispatch, getState);
    dispatch(loadStatusesForProfilesList(data));

    if (success) {
        success(data);
    }
}

export async function autocompleteUsersInTeam(username, success) {
    const {data} = await UserActions.autocompleteUsers(username, getCurrentTeamId(getState()))(dispatch, getState);
    if (success) {
        success(data);
    }
}

export async function autocompleteUsers(username, success) {
    const {data} = await UserActions.autocompleteUsers(username)(dispatch, getState);
    if (success) {
        success(data);
    }
}

export async function updateUser(user, success, error) {
    const {data, error: err} = await UserActions.updateMe(user)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function updateUserNotifyProps(props, success, error) {
    const {data, error: err} = await UserActions.updateMe({notify_props: props})(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function updateUserRoles(userId, newRoles, success, error) {
    const {data, error: err} = await UserActions.updateUserRoles(userId, newRoles)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function updateActive(userId, active, success, error) {
    const {data, error: err} = await UserActions.updateUserActive(userId, active)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function updatePassword(userId, currentPassword, newPassword, success, error) {
    const {data, error: err} = await UserActions.updateUserPassword(userId, currentPassword, newPassword)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export function revokeAllSessions(userId, success, error) {
    UserActions.revokeAllSessionsForUser(userId)(dispatch, getState).then(
        (data) => {
            if (data && success) {
                success(data);
            } else if (data == null && error) {
                const serverError = getState().requests.users.updateUser.error;
                error({id: serverError.server_error_id, ...serverError});
            }
        }
    );
}

export async function verifyEmail(token, success, error) {
    const {data, error: err} = await UserActions.verifyUserEmail(token)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function resetPassword(token, password, success, error) {
    const {data, error: err} = await UserActions.resetUserPassword(token, password)(dispatch, getState);
    if (data) {
        browserHistory.push('/login?extra=' + Constants.PASSWORD_CHANGE);
        if (success) {
            success(data);
        }
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function resendVerification(email, success, error) {
    const {data, error: err} = await UserActions.sendVerificationEmail(email)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export function getAuthorizedApps(success, error) {
    Client4.getAuthorizedOAuthApps(getState().entities.users.currentUserId).then(
        (authorizedApps) => {
            if (success) {
                success(authorizedApps);
            }
        }
    ).catch(
        (err) => {
            if (error) {
                error(err);
            }
        }
    );
}

export function deauthorizeOAuthApp(appId, success, error) {
    Client4.deauthorizeOAuthApp(appId).then(
        () => {
            if (success) {
                success();
            }
        }
    ).catch(
        (err) => {
            if (error) {
                error(err);
            }
        }
    );
}

export async function uploadProfileImage(userPicture, success, error) {
    const {data, error: err} = await UserActions.uploadProfileImage(Selectors.getCurrentUserId(getState()), userPicture)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function loadProfiles(page, perPage, options = {}, success) {
    const {data} = await UserActions.getProfiles(page, perPage, options)(dispatch, getState);
    if (success) {
        success(data);
    }
}

export function autoResetStatus() {
    return async (doDispatch, doGetState) => {
        const {currentUserId} = getState().entities.users;
        const {data: userStatus} = await UserActions.getStatus(currentUserId)(doDispatch, doGetState);

        if (userStatus.status === UserStatuses.OUT_OF_OFFICE || !userStatus.manual) {
            return userStatus;
        }

        const autoReset = getBool(getState(), PreferencesRedux.CATEGORY_AUTO_RESET_MANUAL_STATUS, currentUserId, false);

        if (autoReset) {
            UserActions.setStatus({user_id: currentUserId, status: 'online'})(doDispatch, doGetState);
            return userStatus;
        }

        return userStatus;
    };
}

export async function sendPasswordResetEmail(email, success, error) {
    const {data, error: err} = await UserActions.sendPasswordResetEmail(email)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}
