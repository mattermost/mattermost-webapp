// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PQueue from 'p-queue';

import {getChannelAndMyMember, getChannelMembersByIds} from 'mattermost-redux/actions/channels';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getTeamMembersByIds} from 'mattermost-redux/actions/teams';
import * as UserActions from 'mattermost-redux/actions/users';
import {Preferences as PreferencesRedux, General} from 'mattermost-redux/constants';
import {
    getChannel,
    getCurrentChannelId,
    getMyChannels,
    getMyChannelMember,
    getChannelMembersInChannels,
    getDirectChannels,
} from 'mattermost-redux/selectors/entities/channels';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeamId, getTeamMember} from 'mattermost-redux/selectors/entities/teams';
import * as Selectors from 'mattermost-redux/selectors/entities/users';
import {makeFilterAutoclosedDMs, makeFilterManuallyClosedDMs} from 'mattermost-redux/selectors/entities/channel_categories';
import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';

import {loadStatusesForProfilesList, loadStatusesForProfilesMap} from 'actions/status_actions.jsx';
import {trackEvent} from 'actions/telemetry_actions.jsx';
import store from 'stores/redux_store.jsx';
import * as Utils from 'utils/utils.jsx';
import {Constants, Preferences, UserStatuses} from 'utils/constants';

export const queue = new PQueue({concurrency: 4});
const dispatch = store.dispatch;
const getState = store.getState;

export const filterAutoclosedDMs = makeFilterAutoclosedDMs();
export const filterManuallyClosedDMs = makeFilterManuallyClosedDMs();

export function loadProfilesAndStatusesInChannel(channelId, page = 0, perPage = General.PROFILE_CHUNK_SIZE, sort = '', options = {}) {
    return async (doDispatch) => {
        const {data} = await doDispatch(UserActions.getProfilesInChannel(channelId, page, perPage, sort, options));
        if (data) {
            doDispatch(loadStatusesForProfilesList(data));
        }
        return {data: true};
    };
}

export function loadProfilesAndReloadTeamMembers(page, perPage, teamId, options = {}) {
    return async (doDispatch, doGetState) => {
        const newTeamId = teamId || getCurrentTeamId(doGetState());
        const {data} = await doDispatch(UserActions.getProfilesInTeam(newTeamId, page, perPage, '', options));
        if (data) {
            await Promise.all([
                doDispatch(loadTeamMembersForProfilesList(data, newTeamId, true)),
                doDispatch(loadStatusesForProfilesList(data)),
            ]);
        }

        return {data: true};
    };
}

export function loadProfilesAndReloadChannelMembers(page, perPage, channelId, sort = '', options = {}) {
    return async (doDispatch, doGetState) => {
        const newChannelId = channelId || getCurrentChannelId(doGetState());
        const {data} = await doDispatch(UserActions.getProfilesInChannel(newChannelId, page, perPage, sort, options));
        if (data) {
            await Promise.all([
                doDispatch(loadChannelMembersForProfilesList(data, newChannelId, true)),
                doDispatch(loadStatusesForProfilesList(data)),
            ]);
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

export function searchProfilesAndTeamMembers(term = '', options = {}) {
    return async (doDispatch, doGetState) => {
        const newTeamId = options.team_id || getCurrentTeamId(doGetState());
        const {data} = await doDispatch(UserActions.searchProfiles(term, options));
        if (data) {
            await Promise.all([
                doDispatch(loadTeamMembersForProfilesList(data, newTeamId)),
                doDispatch(loadStatusesForProfilesList(data)),
            ]);
        }

        return {data: true};
    };
}

export function searchProfilesAndChannelMembers(term, options = {}) {
    return async (doDispatch, doGetState) => {
        const newChannelId = options.in_channel_id || getCurrentChannelId(doGetState());
        const {data} = await doDispatch(UserActions.searchProfiles(term, options));
        if (data) {
            await Promise.all([
                doDispatch(loadChannelMembersForProfilesList(data, newChannelId)),
                doDispatch(loadStatusesForProfilesList(data)),
            ]);
        }

        return {data: true};
    };
}

export function loadProfilesAndTeamMembersAndChannelMembers(page, perPage, teamId, channelId, options) {
    return async (doDispatch, doGetState) => {
        const state = doGetState();
        const teamIdParam = teamId || getCurrentTeamId(state);
        const channelIdParam = channelId || getCurrentChannelId(state);
        const {data} = await doDispatch(UserActions.getProfilesInChannel(channelIdParam, page, perPage, '', options));
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

export function loadTeamMembersForProfilesList(profiles, teamId, reloadAllMembers = false) {
    return async (doDispatch, doGetState) => {
        const state = doGetState();
        const teamIdParam = teamId || getCurrentTeamId(state);
        const membersToLoad = {};
        for (let i = 0; i < profiles.length; i++) {
            const pid = profiles[i].id;

            if (reloadAllMembers === true || !getTeamMember(state, teamIdParam, pid)) {
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

export function loadChannelMembersForProfilesList(profiles, channelId, reloadAllMembers = false) {
    return async (doDispatch, doGetState) => {
        const state = doGetState();
        const channelIdParam = channelId || getCurrentChannelId(state);
        const membersToLoad = {};
        for (let i = 0; i < profiles.length; i++) {
            const pid = profiles[i].id;

            const members = getChannelMembersInChannels(state)[channelIdParam];
            if (reloadAllMembers === true || !members || !members[pid]) {
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
                savePreferences(currentUserId, [
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
                dispatch(savePreferences(currentUserId, [{user_id: currentUserId, category: Preferences.CATEGORY_GROUP_CHANNEL_SHOW, name: channelId, value: 'true'}]));
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

export async function loadProfilesForSidebar() {
    await Promise.all([loadProfilesForDM(), loadProfilesForGM()]);
}

export function filterGMsDMs(state, channels) {
    const filteredClosedChannels = filterAutoclosedDMs(state, channels, CategoryTypes.DIRECT_MESSAGES);
    return filterManuallyClosedDMs(state, filteredClosedChannels);
}

export async function loadProfilesForGM() {
    const state = getState();
    const newPreferences = [];
    const userIdsInChannels = Selectors.getUserIdsInChannels(state);
    const currentUserId = Selectors.getCurrentUserId(state);

    const channels = getMyChannels(state);
    const filteredChannels = filterGMsDMs(state, channels);

    for (let i = 0; i < filteredChannels.length; i++) {
        const channel = filteredChannels[i];
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

        const getProfilesAction = UserActions.getProfilesInChannel(channel.id, 0, Constants.MAX_USERS_IN_GM);
        queue.add(() => dispatch(getProfilesAction));
    }

    await queue.onEmpty();
    if (newPreferences.length > 0) {
        dispatch(savePreferences(currentUserId, newPreferences));
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
        savePreferences(currentUserId, newPreferences)(dispatch, getState);
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

export function trackDMGMOpenChannels() {
    return (doDispatch, doGetState) => {
        const state = doGetState();
        const channels = getDirectChannels(state);
        trackEvent('ui', 'LHS_DM_GM_Count', {count: channels.length});

        return {data: true};
    };
}
