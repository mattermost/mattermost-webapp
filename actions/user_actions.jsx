// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getChannelAndMyMember, getChannelMembersByIds} from 'mattermost-redux/actions/channels';
import {savePreferences as savePreferencesRedux} from 'mattermost-redux/actions/preferences';
import {getTeamMembersByIds} from 'mattermost-redux/actions/teams';
import * as UserActions from 'mattermost-redux/actions/users';
import {Preferences as PreferencesRedux, General} from 'mattermost-redux/constants';
import {
    getChannel,
    getCurrentChannelId,
    getMyChannels,
    getMyChannelMember,
    getChannelMembersInChannels,
} from 'mattermost-redux/selectors/entities/channels';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeamId, getTeamMember} from 'mattermost-redux/selectors/entities/teams';
import * as Selectors from 'mattermost-redux/selectors/entities/users';

import {loadStatusesForProfilesList, loadStatusesForProfilesMap} from 'actions/status_actions.jsx';
import store from 'stores/redux_store.jsx';
import * as Utils from 'utils/utils.jsx';
import {Constants, Preferences, UserStatuses} from 'utils/constants';

const dispatch = store.dispatch;
const getState = store.getState;

export function loadProfilesAndStatusesInChannel(channelId, page = 0, perPage = General.PROFILE_CHUNK_SIZE, sort = '') {
    return async (doDispatch) => {
        const {data} = await doDispatch(UserActions.getProfilesInChannel(channelId, page, perPage, sort));
        if (data) {
            doDispatch(loadStatusesForProfilesList(data));
        }
        return {data: true};
    };
}

export function loadProfilesAndTeamMembers(page, perPage, teamId, options) {
    return async (doDispatch, doGetState) => {
        const newTeamId = teamId || getCurrentTeamId(doGetState());
        const {data} = await doDispatch(UserActions.getProfilesInTeam(newTeamId, page, perPage, '', options));
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

export function loadProfilesWithoutTeam(page, perPage, options) {
    return async (doDispatch) => {
        const {data} = await doDispatch(UserActions.getProfilesWithoutTeam(page, perPage, options));

        doDispatch(loadStatusesForProfilesMap(data));

        return data;
    };
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

export function loadNewDMIfNeeded(channelId) {
    return async (doDispatch, doGetState) => {
        const state = doGetState();
        const currentUserId = Selectors.getCurrentUserId(state);

        function checkPreference(channel) {
            const userId = Utils.getUserIdFromChannelName(channel);

            if (!userId) {
                return;
            }

            const pref = getBool(state, Preferences.CATEGORY_DIRECT_CHANNEL_SHOW, userId, false);
            if (pref === false) {
                const now = Utils.getTimestamp();
                savePreferencesRedux(currentUserId, [
                    {user_id: currentUserId, category: Preferences.CATEGORY_DIRECT_CHANNEL_SHOW, name: userId, value: 'true'},
                    {user_id: currentUserId, category: Preferences.CATEGORY_CHANNEL_OPEN_TIME, name: channelId, value: now.toString()},
                ])(doDispatch, doGetState);
                loadProfilesForDM();
            }
        }

        const channel = getChannel(doGetState(), channelId);
        if (channel) {
            checkPreference(channel);
        } else {
            const {data} = await getChannelAndMyMember(channelId)(doDispatch, doGetState);
            if (data) {
                checkPreference(data.channel);
            }
        }
    };
}

export function loadNewGMIfNeeded(channelId) {
    return async (doDispatch, doGetState) => {
        const state = doGetState();
        const currentUserId = Selectors.getCurrentUserId(state);

        function checkPreference() {
            const pref = getBool(state, Preferences.CATEGORY_GROUP_CHANNEL_SHOW, channelId, false);
            if (pref === false) {
                dispatch(savePreferencesRedux(currentUserId, [{user_id: currentUserId, category: Preferences.CATEGORY_GROUP_CHANNEL_SHOW, name: channelId, value: 'true'}]));
                loadProfilesForGM();
            }
        }

        const channel = getChannel(state, channelId);
        if (!channel) {
            await getChannelAndMyMember(channelId)(doDispatch, doGetState);
        }
        checkPreference();
    };
}

export function loadProfilesForGroupChannels(groupChannels) {
    return (doDispatch, doGetState) => {
        const state = doGetState();
        const userIdsInChannels = Selectors.getUserIdsInChannels(state);

        const groupChannelsToFetch = groupChannels.reduce((acc, {id}) => {
            const userIdsInGroupChannel = (userIdsInChannels[id] || new Set());

            if (userIdsInGroupChannel.size === 0) {
                acc.push(id);
            }
            return acc;
        }, []);

        if (groupChannelsToFetch.length > 0) {
            doDispatch(UserActions.getProfilesInGroupChannels(groupChannelsToFetch));
            return {data: true};
        }

        return {data: false};
    };
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

export function autocompleteUsersInTeam(username) {
    return async (doDispatch, doGetState) => {
        const currentTeamId = getCurrentTeamId(doGetState());
        const {data} = await doDispatch(UserActions.autocompleteUsers(username, currentTeamId));
        return data;
    };
}

export function autocompleteUsers(username) {
    return async (doDispatch) => {
        const {data} = await doDispatch(UserActions.autocompleteUsers(username));
        return data;
    };
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
