// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {getRedirectChannelNameForTeam} from 'mattermost-redux/selectors/entities/channels';

import store from 'stores/redux_store.jsx';
import {getBasePath} from 'selectors/general';
import {PreviousViewedTypes} from 'utils/constants';

const getPreviousTeamIdKey = (userId) => ['user_prev_team', userId].join(':');
const getPreviousChannelNameKey = (userId, teamId) => ['user_team_prev_channel', userId, teamId].join(':');
const getPreviousViewedTypeKey = (userId, teamId) => ['user_team_prev_viewed_type', userId, teamId].join(':');
const getPenultimateViewedTypeKey = (userId, teamId) => ['user_team_penultimate_viewed_type', userId, teamId].join(':');
export const getPenultimateChannelNameKey = (userId, teamId) => ['user_team_penultimate_channel', userId, teamId].join(':');
const getRecentEmojisKey = (userId) => ['recent_emojis', userId].join(':');
const getWasLoggedInKey = () => 'was_logged_in';
const teamIdJoinedOnLoadKey = 'teamIdJoinedOnLoad';
const insightsTimeFrameKey = 'insightsTimeFrame';

const getPathScopedKey = (path, key) => {
    if (path === '' || path === '/') {
        return key;
    }

    return [path, key].join(':');
};

// LocalStorageStore exposes an interface for accessing entries in the localStorage.
//
// Note that this excludes keys managed by redux-persist. The latter cannot currently be used for
// key/value storage that persists beyond logout. Ideally, we could purge all but certain parts
// of the Redux store so as to allow them to be used on re-login.

// Lets open a separate issue to refactor local storage and state interactions.
// This whole store can be connected to redux
class LocalStorageStoreClass {
    getItem(key, state = store.getState()) {
        const basePath = getBasePath(state);

        return localStorage.getItem(getPathScopedKey(basePath, key));
    }

    setItem(key, value) {
        const state = store.getState();
        const basePath = getBasePath(state);

        localStorage.setItem(getPathScopedKey(basePath, key), value);
    }

    getInsightsTimeFrame() {
        return this.getItem(insightsTimeFrameKey);
    }

    getPreviousChannelName(userId, teamId, state = store.getState()) {
        return this.getItem(getPreviousChannelNameKey(userId, teamId), state) || getRedirectChannelNameForTeam(state, teamId);
    }

    getPreviousViewedType(userId, teamId, state = store.getState()) {
        return this.getItem(getPreviousViewedTypeKey(userId, teamId), state) ?? PreviousViewedTypes.CHANNELS;
    }

    removeItem(key) {
        const state = store.getState();
        const basePath = getBasePath(state);

        localStorage.removeItem(getPathScopedKey(basePath, key));
    }

    setInsightsTimeFrame(timeFrame) {
        return this.setItem(insightsTimeFrameKey, timeFrame);
    }

    setPreviousChannelName(userId, teamId, channelName) {
        this.setItem(getPreviousChannelNameKey(userId, teamId), channelName);
    }

    setPreviousViewedType(userId, teamId, channelType) {
        this.setItem(getPreviousViewedTypeKey(userId, teamId), channelType);
    }

    getPenultimateViewedType(userId, teamId, state = store.getState()) {
        return this.getItem(getPenultimateViewedTypeKey(userId, teamId), state) ?? PreviousViewedTypes.CHANNELS;
    }

    setPenultimateViewedType(userId, teamId, channelType) {
        this.setItem(getPenultimateViewedTypeKey(userId, teamId), channelType);
    }
    getPenultimateChannelName(userId, teamId, state = store.getState()) {
        return this.getItem(getPenultimateChannelNameKey(userId, teamId), state) || getRedirectChannelNameForTeam(state, teamId);
    }

    setPenultimateChannelName(userId, teamId, channelName) {
        this.setItem(getPenultimateChannelNameKey(userId, teamId), channelName);
    }

    removePreviousChannelName(userId, teamId, state = store.getState()) {
        this.setItem(getPreviousChannelNameKey(userId, teamId), this.getPenultimateChannelName(userId, teamId, state));
        this.removeItem(getPenultimateChannelNameKey(userId, teamId));
    }

    removePreviousChannelType(userId, teamId, state = store.getStore()) {
        this.setItem(getPreviousViewedTypeKey(userId, teamId), this.getPenultimateViewedType(userId, teamId, state));
        this.removeItem(getPenultimateViewedTypeKey(userId, teamId));
    }

    removePreviousChannel(userId, teamId, state = store.getStore()) {
        this.removePreviousChannelName(userId, teamId, state);
        this.removePreviousChannelType(userId, teamId, state);
    }

    removePenultimateChannelName(userId, teamId) {
        this.removeItem(getPenultimateChannelNameKey(userId, teamId));
    }

    removePenultimateViewedType(userId, teamId) {
        this.removeItem(getPenultimateViewedTypeKey(userId, teamId));
    }

    getPreviousTeamId(userId) {
        return this.getItem(getPreviousTeamIdKey(userId));
    }

    setPreviousTeamId(userId, teamId) {
        this.setItem(getPreviousTeamIdKey(userId), teamId);
    }

    /**
     * Returns the list of recently used emojis for the user in string format.
     * @param {string} userId The user ID.
     * @returns The list of emojis in string format. eg. '['smile','+1', 'pizza']'
     * @memberof LocalStorageStore
     * @example
     * const recentEmojis = LocalStorageStore.getRecentEmojis('userId');
     * if (recentEmojis) {
     *  const recentEmojisArray = JSON.parse(recentEmojis);
     * // do something with the emoji list
     * }
     **/
    getRecentEmojis(userId) {
        const recentEmojis = this.getItem(getRecentEmojisKey(userId));
        if (!recentEmojis) {
            return null;
        }

        return recentEmojis;
    }

    getTeamIdJoinedOnLoad() {
        return this.getItem(teamIdJoinedOnLoadKey);
    }

    setTeamIdJoinedOnLoad(teamId) {
        this.setItem(teamIdJoinedOnLoadKey, teamId);
    }

    setWasLoggedIn(wasLoggedIn) {
        if (wasLoggedIn) {
            this.setItem(getWasLoggedInKey(), 'true');
        } else {
            this.setItem(getWasLoggedInKey(), 'false');
        }
    }

    getWasLoggedIn() {
        return this.getItem(getWasLoggedInKey()) === 'true';
    }
}

const LocalStorageStore = new LocalStorageStoreClass();

export default LocalStorageStore;
