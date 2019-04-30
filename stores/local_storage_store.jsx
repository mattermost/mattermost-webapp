// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {getRedirectChannelNameForTeam} from 'utils/channel_utils.jsx';

const getPreviousTeamIdKey = (userId) => ['user_prev_team', userId].join(':');
const getPreviousChannelNameKey = (userId, teamId) => ['user_team_prev_channel', userId, teamId].join(':');
const getPenultimateChannelNameKey = (userId, teamId) => ['user_team_penultimate_channel', userId, teamId].join(':');
const getRecentEmojisKey = (userId) => ['recent_emojis', userId].join(':');
const getWasLoggedInKey = (subpath) => ['was_logged_in', subpath].join(':');

// LocalStorageStore exposes an interface for accessing entries in the localStorage.
//
// Note that this excludes keys managed by redux-persist. The latter cannot currently be used for
// key/value storage that persists beyond logout. Ideally, we could purge all but certain parts
// of the Redux store so as to allow them to be used on re-login.
class LocalStorageStoreClass {
    getPreviousChannelName(userId, teamId) {
        return localStorage.getItem(getPreviousChannelNameKey(userId, teamId)) || getRedirectChannelNameForTeam(teamId);
    }

    setPreviousChannelName(userId, teamId, channelName) {
        localStorage.setItem(getPreviousChannelNameKey(userId, teamId), channelName);
    }

    getPenultimateChannelName(userId, teamId) {
        return localStorage.getItem(getPenultimateChannelNameKey(userId, teamId)) || getRedirectChannelNameForTeam(teamId);
    }

    setPenultimateChannelName(userId, teamId, channelName) {
        localStorage.setItem(getPenultimateChannelNameKey(userId, teamId), channelName);
    }

    getPreviousTeamId(userId) {
        return localStorage.getItem(getPreviousTeamIdKey(userId));
    }

    setPreviousTeamId(userId, teamId) {
        localStorage.setItem(getPreviousTeamIdKey(userId), teamId);
    }

    getRecentEmojis(userId) {
        const recentEmojis = localStorage.getItem(getRecentEmojisKey(userId));
        if (!recentEmojis) {
            return null;
        }

        return JSON.parse(recentEmojis);
    }

    setRecentEmojis(userId, recentEmojis = []) {
        if (recentEmojis.length) {
            localStorage.setItem(getRecentEmojisKey(userId), JSON.stringify(recentEmojis));
        }
    }

    setWasLoggedIn(subpath, wasLoggedIn) {
        if (wasLoggedIn) {
            localStorage.setItem(getWasLoggedInKey(subpath), 'true');
        } else {
            localStorage.setItem(getWasLoggedInKey(subpath), 'false');
        }
    }

    getWasLoggedIn(subpath) {
        return localStorage.getItem(getWasLoggedInKey(subpath)) === 'true';
    }
}

const LocalStorageStore = new LocalStorageStoreClass();

export default LocalStorageStore;
