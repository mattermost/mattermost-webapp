// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {getChannelAndMyMember} from 'mattermost-redux/actions/channels';
import {getClientConfig, getLicenseConfig} from 'mattermost-redux/actions/general';
import {deletePreferences as deletePreferencesRedux, savePreferences as savePreferencesRedux} from 'mattermost-redux/actions/preferences';
import {getMyTeamMembers, getMyTeamUnreads, getTeamMembersByIds} from 'mattermost-redux/actions/teams';
import * as UserActions from 'mattermost-redux/actions/users';
import {Client4} from 'mattermost-redux/client';
import {Preferences as PreferencesRedux} from 'mattermost-redux/constants';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import * as Selectors from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {browserHistory} from 'utils/browser_history';
import {getChannelMembersForUserIds} from 'actions/channel_actions.jsx';
import {loadCurrentLocale} from 'actions/global_actions.jsx';
import {loadStatusesForProfilesList, loadStatusesForProfilesMap} from 'actions/status_actions.jsx';
import ChannelStore from 'stores/channel_store.jsx';
import PreferenceStore from 'stores/preference_store.jsx';
import store from 'stores/redux_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';
import * as Utils from 'utils/utils.jsx';
import {Constants, Preferences} from 'utils/constants.jsx';

const dispatch = store.dispatch;
const getState = store.getState;

export async function loadMe() {
    await UserActions.loadMe()(dispatch, getState);
    loadCurrentLocale();
}

export async function loadMeAndConfig(callback) {
    const {data: config} = await getClientConfig()(store.dispatch, store.getState);

    const promises = [];

    if (document.cookie.indexOf('MMUSERID=') > -1) {
        if (global.window && global.window.analytics) {
            global.window.analytics.identify(config.DiagnosticId, {}, {
                context: {
                    ip: '0.0.0.0',
                },
                page: {
                    path: '',
                    referrer: '',
                    search: '',
                    title: '',
                    url: '',
                },
                anonymousId: '00000000000000000000000000',
            });
        }

        promises.push(loadMe());
    }

    promises.push(getLicenseConfig()(store.dispatch, store.getState));

    Promise.all(promises).then(callback);
}

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

export async function loadProfilesAndTeamMembers(page, perPage, teamId = TeamStore.getCurrentId(), success) {
    const {data} = await UserActions.getProfilesInTeam(teamId, page, perPage)(dispatch, getState);
    loadTeamMembersForProfilesList(data, teamId, success);
    loadStatusesForProfilesList(data);
}

export async function loadProfilesAndTeamMembersAndChannelMembers(page, perPage, teamId = TeamStore.getCurrentId(), channelId = ChannelStore.getCurrentId(), success, error) {
    const {data} = await UserActions.getProfilesInChannel(channelId, page, perPage)(dispatch, getState);

    loadTeamMembersForProfilesList(
        data,
        teamId,
        () => {
            loadChannelMembersForProfilesList(data, channelId, success, error);
            loadStatusesForProfilesList(data);
        }
    );
}

export function loadTeamMembersForProfilesList(profiles, teamId = TeamStore.getCurrentId(), success, error) {
    const membersToLoad = {};
    for (let i = 0; i < profiles.length; i++) {
        const pid = profiles[i].id;

        if (!TeamStore.hasActiveMemberInTeam(teamId, pid)) {
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
    loadStatusesForProfilesMap(data);

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

export function loadChannelMembersForProfilesMap(profiles, channelId = ChannelStore.getCurrentId(), success, error) {
    const membersToLoad = {};
    for (const pid in profiles) {
        if (!profiles.hasOwnProperty(pid)) {
            continue;
        }

        if (!ChannelStore.hasActiveMemberInChannel(channelId, pid)) {
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

export function loadTeamMembersAndChannelMembersForProfilesList(profiles, teamId = TeamStore.getCurrentId(), channelId = ChannelStore.getCurrentId(), success, error) {
    loadTeamMembersForProfilesList(profiles, teamId, () => {
        loadChannelMembersForProfilesList(profiles, channelId, success, error);
    }, error);
}

export function loadChannelMembersForProfilesList(profiles, channelId = ChannelStore.getCurrentId(), success, error) {
    const membersToLoad = {};
    for (let i = 0; i < profiles.length; i++) {
        const pid = profiles[i].id;

        if (!ChannelStore.hasActiveMemberInChannel(channelId, pid)) {
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

function populateDMChannelsWithProfiles(userIds) {
    const currentUserId = UserStore.getCurrentId();

    for (let i = 0; i < userIds.length; i++) {
        const channelName = Utils.getDirectChannelName(currentUserId, userIds[i]);
        const channel = ChannelStore.getByName(channelName);
        const profilesInChannel = Selectors.getUserIdsInChannels(getState())[channel.id] || new Set();
        if (channel && !profilesInChannel.has(userIds[i])) {
            UserStore.saveUserIdInChannel(channel.id, userIds[i]);
        }
    }
}

function populateChannelWithProfiles(channelId, users) {
    for (let i = 0; i < users.length; i++) {
        UserStore.saveUserIdInChannel(channelId, users[i].id);
    }
    UserStore.emitInChannelChange();
}

export async function loadNewDMIfNeeded(channelId) {
    function checkPreference(channel) {
        const userId = Utils.getUserIdFromChannelName(channel);

        if (!userId) {
            return;
        }

        const pref = PreferenceStore.getBool(Preferences.CATEGORY_DIRECT_CHANNEL_SHOW, userId, false);
        if (pref === false) {
            const now = Utils.getTimestamp();
            PreferenceStore.setPreference(Preferences.CATEGORY_DIRECT_CHANNEL_SHOW, userId, 'true');
            PreferenceStore.setPreference(Preferences.CATEGORY_CHANNEL_OPEN_TIME, channelId, now.toString());
            const currentUserId = UserStore.getCurrentId();
            savePreferencesRedux(currentUserId, [
                {user_id: currentUserId, category: Preferences.CATEGORY_DIRECT_CHANNEL_SHOW, name: userId, value: 'true'},
                {user_id: currentUserId, category: Preferences.CATEGORY_CHANNEL_OPEN_TIME, name: channelId, value: now.toString()},
            ])(dispatch, getState);
            loadProfilesForDM();
        }
    }

    const channel = ChannelStore.get(channelId);
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
        const pref = PreferenceStore.getBool(Preferences.CATEGORY_GROUP_CHANNEL_SHOW, channelId, false);
        if (pref === false) {
            PreferenceStore.setPreference(Preferences.CATEGORY_GROUP_CHANNEL_SHOW, channelId, 'true');
            const currentUserId = UserStore.getCurrentId();
            savePreferencesRedux(currentUserId, [{user_id: currentUserId, category: Preferences.CATEGORY_GROUP_CHANNEL_SHOW, name: channelId, value: 'true'}])(dispatch, getState);
            loadProfilesForGM();
        }
    }

    const channel = ChannelStore.get(channelId);
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
    const channels = ChannelStore.getChannels();
    const newPreferences = [];

    for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        if (channel.type !== Constants.GM_CHANNEL) {
            continue;
        }

        if (UserStore.getProfileListInChannel(channel.id).length >= Constants.MIN_USERS_IN_GM) {
            continue;
        }

        const isVisible = PreferenceStore.getBool(Preferences.CATEGORY_GROUP_CHANNEL_SHOW, channel.id);

        if (!isVisible) {
            const member = ChannelStore.getMyMember(channel.id);
            if (!member || (member.mention_count === 0 && member.msg_count >= channel.total_msg_count)) {
                continue;
            }

            newPreferences.push({
                user_id: UserStore.getCurrentId(),
                category: Preferences.CATEGORY_GROUP_CHANNEL_SHOW,
                name: channel.id,
                value: 'true',
            });
        }

        UserActions.getProfilesInChannel(channel.id, 0, Constants.MAX_USERS_IN_GM)(dispatch, getState).then(({data}) => {
            populateChannelWithProfiles(channel.id, data);
        });
    }

    if (newPreferences.length > 0) {
        const currentUserId = UserStore.getCurrentId();
        savePreferencesRedux(currentUserId, newPreferences)(dispatch, getState);
    }
}

export async function loadProfilesForDM() {
    const channels = ChannelStore.getChannels();
    const newPreferences = [];
    const profilesToLoad = [];
    const profileIds = [];

    for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        if (channel.type !== Constants.DM_CHANNEL) {
            continue;
        }

        const teammateId = channel.name.replace(UserStore.getCurrentId(), '').replace('__', '');
        const isVisible = PreferenceStore.getBool(Preferences.CATEGORY_DIRECT_CHANNEL_SHOW, teammateId);

        if (!isVisible) {
            const member = ChannelStore.getMyMember(channel.id);
            if (!member || member.mention_count === 0) {
                continue;
            }

            newPreferences.push({
                user_id: UserStore.getCurrentId(),
                category: Preferences.CATEGORY_DIRECT_CHANNEL_SHOW,
                name: teammateId,
                value: 'true',
            });
        }

        if (!UserStore.hasProfile(teammateId)) {
            profilesToLoad.push(teammateId);
        }
        profileIds.push(teammateId);
    }

    if (newPreferences.length > 0) {
        const currentUserId = UserStore.getCurrentId();
        savePreferencesRedux(currentUserId, newPreferences)(dispatch, getState);
    }

    if (profilesToLoad.length > 0) {
        await UserActions.getProfilesByIds(profilesToLoad)(dispatch, getState);
    }
    populateDMChannelsWithProfiles(profileIds);
}

export async function saveTheme(teamId, theme, cb) {
    const currentUserId = UserStore.getCurrentId();
    const preference = [{
        user_id: currentUserId,
        category: Preferences.CATEGORY_THEME,
        name: teamId,
        value: JSON.stringify(theme),
    }];

    await savePreferencesRedux(currentUserId, preference)(dispatch, getState);
    onThemeSaved(teamId, theme, cb);
}

function onThemeSaved(teamId, theme, onSuccess) {
    const themePreferences = PreferenceStore.getCategory(Preferences.CATEGORY_THEME);

    if (teamId !== '' && themePreferences.size > 1) {
        // no extra handling to be done to delete team-specific themes
        onSuccess();
        return;
    }

    const toDelete = [];

    for (const [name] of themePreferences) {
        if (name === '' || name === teamId) {
            continue;
        }

        toDelete.push({
            user_id: UserStore.getCurrentId(),
            category: Preferences.CATEGORY_THEME,
            name,
        });
    }

    if (toDelete.length > 0) {
        // we're saving a new global theme so delete any team-specific ones
        const currentUserId = UserStore.getCurrentId();
        deletePreferencesRedux(currentUserId, toDelete)(dispatch, getState);
    }

    onSuccess();
}

export async function searchUsers(term, teamId = TeamStore.getCurrentId(), options = {}, success) {
    const {data} = await UserActions.searchProfiles(term, {team_id: teamId, ...options})(dispatch, getState);
    loadStatusesForProfilesList(data);

    if (success) {
        success(data);
    }
}

export async function searchUsersNotInTeam(term, teamId = TeamStore.getCurrentId(), options = {}, success) {
    const {data} = await UserActions.searchProfiles(term, {not_in_team_id: teamId, ...options})(dispatch, getState);
    loadStatusesForProfilesList(data);

    if (success) {
        success(data);
    }
}

export async function autocompleteUsersInChannel(username, channelId, success) {
    const channel = ChannelStore.get(channelId);
    const teamId = channel ? channel.team_id : TeamStore.getCurrentId();
    const {data} = await UserActions.autocompleteUsers(username, teamId, channelId)(dispatch, getState);
    if (success) {
        success(data);
    }
}

export async function autocompleteUsersInTeam(username, success) {
    const {data} = await UserActions.autocompleteUsers(username, TeamStore.getCurrentId())(dispatch, getState);
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
    const {data, error: err} = await UserActions.generateMfaSecret(UserStore.getCurrentId())(dispatch, getState);
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
    const {data, error: err} = await UserActions.updateUserMfa(UserStore.getCurrentId(), true, code)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function deactivateMfa(success, error) {
    const {data, error: err} = await UserActions.updateUserMfa(UserStore.getCurrentId(), false)(dispatch, getState);
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

export async function createUserWithInvite(user, data, emailHash, inviteId, success, error) {
    const {data: resp, error: err} = await UserActions.createUser(user, data, emailHash, inviteId)(dispatch, getState);
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
    const missingIds = ids.filter((id) => !UserStore.hasProfile(id));

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
    const currentUserId = UserStore.getCurrentId();
    await savePreferencesRedux(currentUserId, prefs)(dispatch, getState);
    callback();
}

export async function savePreference(category, name, value) {
    const currentUserId = UserStore.getCurrentId();
    return savePreferencesRedux(currentUserId, [{user_id: currentUserId, category, name, value}])(dispatch, getState);
}

export function deletePreferences(prefs) {
    const currentUserId = UserStore.getCurrentId();
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
