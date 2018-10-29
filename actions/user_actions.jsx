// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getChannelAndMyMember} from 'mattermost-redux/actions/channels';
import {deletePreferences as deletePreferencesRedux, savePreferences as savePreferencesRedux} from 'mattermost-redux/actions/preferences';
import {getMyTeamMembers, getMyTeamUnreads, getTeamMembersByIds} from 'mattermost-redux/actions/teams';
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
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {browserHistory} from 'utils/browser_history';
import {getChannelMembersForUserIds} from 'actions/channel_actions.jsx';
import {loadStatusesForProfilesList, loadStatusesForProfilesMap} from 'actions/status_actions.jsx';
import store from 'stores/redux_store.jsx';
import * as Utils from 'utils/utils.jsx';
import {Constants, Preferences} from 'utils/constants.jsx';

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

export async function loadProfilesAndTeamMembers(page, perPage, teamId = getCurrentTeamId(getState()), success) {
    const {data} = await UserActions.getProfilesInTeam(teamId, page, perPage)(dispatch, getState);
    loadTeamMembersForProfilesList(data, teamId, success);
    dispatch(loadStatusesForProfilesList(data));
}

export async function loadProfilesAndTeamMembersAndChannelMembers(page, perPage, teamId = getCurrentTeamId(getState()), channelId = getCurrentChannelId(getState()), success, error) {
    const {data} = await UserActions.getProfilesInChannel(channelId, page, perPage)(dispatch, getState);

    loadTeamMembersForProfilesList(
        data,
        teamId,
        () => {
            loadChannelMembersForProfilesList(data, channelId, success, error);
            dispatch(loadStatusesForProfilesList(data));
        }
    );
}

export function loadTeamMembersForProfilesList(profiles, teamId = getCurrentTeamId(getState()), success, error) {
    const state = getState();
    const membersToLoad = {};
    for (let i = 0; i < profiles.length; i++) {
        const pid = profiles[i].id;

        if (!getTeamMember(state, teamId, pid)) {
            membersToLoad[pid] = true;
        }
    }

    const list = Object.keys(membersToLoad);
    if (list.length === 0) {
        if (success) {
            success({});
        }
        return;
    }

    loadTeamMembersForProfiles(list, teamId, success, error);
}

export async function loadProfilesWithoutTeam(page, perPage, success) {
    const {data} = await UserActions.getProfilesWithoutTeam(page, perPage)(dispatch, getState);
    dispatch(loadStatusesForProfilesMap(data));

    if (success) {
        success(data);
    }
}

async function loadTeamMembersForProfiles(userIds, teamId, success, error) {
    const {data, error: err} = await getTeamMembersByIds(teamId, userIds)(dispatch, getState);

    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export function loadChannelMembersForProfilesMap(profiles, channelId = getCurrentChannelId(getState()), success, error) {
    const membersToLoad = {};
    for (const pid in profiles) {
        if (!profiles.hasOwnProperty(pid)) {
            continue;
        }

        const members = getChannelMembersInChannels(getState())[channelId];
        if (!members || !members[pid]) {
            membersToLoad[pid] = true;
        }
    }

    const list = Object.keys(membersToLoad);
    if (list.length === 0) {
        if (success) {
            success({});
        }
        return;
    }

    getChannelMembersForUserIds(channelId, list, success, error);
}

export function loadTeamMembersAndChannelMembersForProfilesList(profiles, teamId = getCurrentTeamId(getState()), channelId = getCurrentChannelId(getState()), success, error) {
    loadTeamMembersForProfilesList(profiles, teamId, () => {
        loadChannelMembersForProfilesList(profiles, channelId, success, error);
    }, error);
}

export function loadChannelMembersForProfilesList(profiles, channelId = getCurrentChannelId(getState()), success, error) {
    const membersToLoad = {};
    for (let i = 0; i < profiles.length; i++) {
        const pid = profiles[i].id;

        const members = getChannelMembersInChannels(getState())[channelId];
        if (!members || !members[pid]) {
            membersToLoad[pid] = true;
        }
    }

    const list = Object.keys(membersToLoad);
    if (list.length === 0) {
        if (success) {
            success({});
        }
        return;
    }

    getChannelMembersForUserIds(channelId, list, success, error);
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

        const userIds = userIdsInChannels[channel.id] || [];
        if (userIds.length >= Constants.MIN_USERS_IN_GM) {
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

export async function saveTheme(teamId, theme, cb) {
    const currentUserId = Selectors.getCurrentUserId(getState());
    const preference = [{
        user_id: currentUserId,
        category: Preferences.CATEGORY_THEME,
        name: teamId,
        value: JSON.stringify(theme),
    }];

    await savePreferencesRedux(currentUserId, preference)(dispatch, getState);
    onThemeSaved(teamId, cb);
}

function onThemeSaved(teamId, onSuccess) {
    const getCategory = makeGetCategory();
    const themePreferences = getCategory(getState(), Preferences.CATEGORY_THEME);

    if (teamId !== '' && themePreferences.size > 1) {
        // no extra handling to be done to delete team-specific themes
        onSuccess();
        return;
    }

    const currentUserId = Selectors.getCurrentUserId(getState());
    const toDelete = [];

    for (const themePreference of themePreferences) {
        if (themePreference.name === '' || themePreference.name === teamId) {
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
        deletePreferencesRedux(currentUserId, toDelete)(dispatch, getState);
    }

    onSuccess();
}

export async function searchUsers(term, teamId = getCurrentTeamId(getState()), options = {}, success) {
    const {data} = await UserActions.searchProfiles(term, {team_id: teamId, ...options})(dispatch, getState);
    dispatch(loadStatusesForProfilesList(data));

    if (success) {
        success(data);
    }
}

export async function autocompleteUsersInChannel(username, channelId, success) {
    const channel = getChannel(getState(), channelId);
    const teamId = channel ? channel.team_id : getCurrentTeamId(getState());
    const {data} = await UserActions.autocompleteUsers(username, teamId, channelId)(dispatch, getState);
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

export async function generateMfaSecret(success, error) {
    const {data, error: err} = await UserActions.generateMfaSecret(Selectors.getCurrentUserId(getState()))(dispatch, getState);
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

export async function activateMfa(code, success, error) {
    const {data, error: err} = await UserActions.updateUserMfa(Selectors.getCurrentUserId(getState()), true, code)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function deactivateMfa(success, error) {
    const {data, error: err} = await UserActions.updateUserMfa(Selectors.getCurrentUserId(getState()), false)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function checkMfa(loginId, success, error) {
    const config = getConfig(getState());

    if (config.EnableMultifactorAuthentication !== 'true') {
        success(false);
        return;
    }

    const {data, error: err} = await UserActions.checkMfa(loginId)(dispatch, getState);
    if (data != null && success) {
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

export async function loginById(userId, password, mfaToken, success, error) {
    const {data: ok, error: err} = await UserActions.loginById(userId, password, mfaToken)(dispatch, getState);
    if (ok && success) {
        success();
    } else if (err && error) {
        if (err.server_error_id === 'api.context.mfa_required.app_error') {
            if (success) {
                success();
            }
            return;
        }
        error({id: err.server_error_id, ...err});
    }
}

export async function createUserWithInvite(user, token, inviteId, success, error) {
    const {data: resp, error: err} = await UserActions.createUser(user, token, inviteId)(dispatch, getState);
    if (resp && success) {
        success(resp);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function webLogin(loginId, password, token, success, error) {
    const {data: ok, error: err} = await UserActions.login(loginId, password, token)(dispatch, getState);
    if (ok && success) {
        success();
    } else if (err && error) {
        if (err.server_error_id === 'api.context.mfa_required.app_error') {
            if (success) {
                success();
            }
            return;
        }
        error({id: err.server_error_id, ...err});
    }
}

export async function updateTermsOfServiceStatus(termsOfServiceId, accepted, success, error) {
    const {data, error: err} = await UserActions.updateTermsOfServiceStatus(termsOfServiceId, accepted)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function getTermsOfService(success, error) {
    const {data, error: err} = await UserActions.getTermsOfService()(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function webLoginByLdap(loginId, password, token, success, error) {
    const {data: ok, error: err} = await UserActions.login(loginId, password, token, true)(dispatch, getState);
    if (ok && success) {
        success();
    } else if (err && error) {
        if (err.server_error_id === 'api.context.mfa_required.app_error') {
            if (success) {
                success();
            }
            return;
        }
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

export async function loadProfiles(page, perPage, success) {
    const {data} = await UserActions.getProfiles(page, perPage)(dispatch, getState);
    if (success) {
        success(data);
    }
}

export function getMissingProfiles(ids) {
    const state = getState();
    const missingIds = ids.filter((id) => !Selectors.getUser(state, id));

    if (missingIds.length === 0) {
        return;
    }

    UserActions.getProfilesByIds(missingIds)(dispatch, getState);
}

export async function loadMyTeamMembers() {
    await getMyTeamMembers()(dispatch, getState);
    getMyTeamUnreads()(dispatch, getState);
}

export async function savePreferences(prefs, callback) {
    const currentUserId = Selectors.getCurrentUserId(getState());
    await savePreferencesRedux(currentUserId, prefs)(dispatch, getState);
    callback();
}

export async function savePreference(category, name, value) {
    const currentUserId = Selectors.getCurrentUserId(getState());
    return savePreferencesRedux(currentUserId, [{user_id: currentUserId, category, name, value}])(dispatch, getState);
}

export function deletePreferences(prefs) {
    const currentUserId = Selectors.getCurrentUserId(getState());
    return deletePreferencesRedux(currentUserId, prefs)(dispatch, getState);
}

export function autoResetStatus() {
    return async (doDispatch, doGetState) => {
        const {currentUserId} = getState().entities.users;
        const {data: userStatus} = await UserActions.getStatus(currentUserId)(doDispatch, doGetState);

        if (!userStatus.manual) {
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
