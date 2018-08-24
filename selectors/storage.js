// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {getPrefix} from 'utils/storage_utils';

import Constants from 'utils/constants';

export const getGlobalItem = (state, name, defaultValue) => {
    const storage = state && state.storage && state.storage.storage;

    return getItemFromStorage(storage, name, defaultValue);
};

export const makeGetItem = (name, defaultValue) => {
    return (state) => {
        return getGlobalItem(state, getPrefix(state) + name, defaultValue);
    };
};

export const makeGetGlobalItem = (name, defaultValue) => {
    return (state) => {
        return getGlobalItem(state, name, defaultValue);
    };
};

export const getItemFromStorage = (storage, name, defaultValue) => {
    if (storage &&
        typeof storage[name] !== 'undefined' &&
        storage[name] !== null &&
        typeof storage[name].value !== 'undefined' &&
        storage[name].value !== null) {
        return storage[name].value;
    }

    return defaultValue;
};

export const getStorage = (state) => state.storage;

export const getLastViewedChannelName = createSelector(
    getStorage,
    getCurrentTeamId,
    (storage, currentTeamId) => {
        const entry = storage.storage[`${Constants.PREV_CHANNEL_KEY}${currentTeamId}`];
        return entry ? entry.value : null;
    }
);