// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {getRedirectChannelNameForTeam} from 'utils/channel_utils.jsx';
import store from 'stores/redux_store.jsx';
import {getBasePath} from 'selectors/general';

const getPreviousTeamIdKey = (userId) => ['user_prev_team', userId].join(':');
const getPreviousChannelNameKey = (userId, teamId) => ['user_team_prev_channel', userId, teamId].join(':');
const getPenultimateChannelNameKey = (userId, teamId) => ['user_team_penultimate_channel', userId, teamId].join(':');
const getRecentEmojisKey = (userId) => ['recent_emojis', userId].join(':');
const getWasLoggedInKey = () => 'was_logged_in';

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
class LocalStorageStoreClass {
    getItem(key) {
        const state = store.getState();
        const basePath = getBasePath(state);

        return localStorage.getItem(getPathScopedKey(basePath, key));
    }

    setItem(key, value) {
        const state = store.getState();
        const basePath = getBasePath(state);

        localStorage.setItem(getPathScopedKey(basePath, key), value);
    }

    getPreviousChannelName(userId, teamId) {
        return this.getItem(getPreviousChannelNameKey(userId, teamId)) || getRedirectChannelNameForTeam(teamId);
    }

    setPreviousChannelName(userId, teamId, channelName) {
        this.setItem(getPreviousChannelNameKey(userId, teamId), channelName);
    }

    getPenultimateChannelName(userId, teamId) {
        return this.getItem(getPenultimateChannelNameKey(userId, teamId)) || getRedirectChannelNameForTeam(teamId);
    }

    setPenultimateChannelName(userId, teamId, channelName) {
        this.setItem(getPenultimateChannelNameKey(userId, teamId), channelName);
    }

    removePreviousChannelName(userId, teamId) {
        localStorage.setItem(getPreviousChannelNameKey(userId, teamId), this.getPenultimateChannelName(userId, teamId));
        localStorage.removeItem(getPenultimateChannelNameKey(userId, teamId));
    }

    getPreviousTeamId(userId) {
        return this.getItem(getPreviousTeamIdKey(userId));
    }

    setPreviousTeamId(userId, teamId) {
        this.setItem(getPreviousTeamIdKey(userId), teamId);
    }

    getRecentEmojis(userId) {
        const recentEmojis = this.getItem(getRecentEmojisKey(userId));
        if (!recentEmojis) {
            return null;
        }

        return JSON.parse(recentEmojis);
    }

    setRecentEmojis(userId, recentEmojis = []) {
        if (recentEmojis.length) {
            this.setItem(getRecentEmojisKey(userId), JSON.stringify(recentEmojis));
        }
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
