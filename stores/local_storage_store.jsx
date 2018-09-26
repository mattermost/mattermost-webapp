// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Constants} from 'utils/constants.jsx';

const getPreviousTeamIdKey = (userId) => ['user_prev_team', userId].join(':');
const getPreviousChannelNameKey = (userId, teamId) => ['user_team_prev_channel', userId, teamId].join(':');

// LocalStorageStore exposes an interface for accessing entries in the localStorage.
//
// Note that this excludes keys managed by redux-persist. The latter cannot currently be used for
// key/value storage that persists beyond logout. Ideally, we could purge all but certain parts
// of the Redux store so as to allow them to be used on re-login.
class LocalStorageStoreClass {
    getPreviousChannelName(userId, teamId) {
        return localStorage.getItem(getPreviousChannelNameKey(userId, teamId)) || Constants.DEFAULT_CHANNEL;
    }

    setPreviousChannelName(userId, teamId, channelName) {
        localStorage.setItem(getPreviousChannelNameKey(userId, teamId), channelName);
    }

    getPreviousTeamId(userId) {
        return localStorage.getItem(getPreviousTeamIdKey(userId));
    }

    setPreviousTeamId(userId, teamId) {
        localStorage.setItem(getPreviousTeamIdKey(userId), teamId);
    }
}

const LocalStorageStore = new LocalStorageStoreClass();

export default LocalStorageStore;
