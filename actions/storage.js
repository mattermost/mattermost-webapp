// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import deepEqual from 'fast-deep-equal';

import {batchActions} from 'mattermost-redux/types/actions';

import {getGlobalItem} from 'selectors/storage';

import {StoragePrefixes, StorageTypes} from 'utils/constants';
import {getPrefix} from 'utils/storage_utils';

export function setItem(name, value) {
    return (dispatch, getState) => {
        const state = getState();
        const prefix = getPrefix(state);
        dispatch({
            type: StorageTypes.SET_ITEM,
            data: {prefix, name, value, timestamp: new Date()},
        });
        return {data: true};
    };
}

export function removeItem(name) {
    return (dispatch, getState) => {
        const state = getState();
        const prefix = getPrefix(state);
        dispatch({
            type: StorageTypes.REMOVE_ITEM,
            data: {prefix, name},
        });
        return {data: true};
    };
}

export function setGlobalItem(name, value) {
    return {
        type: StorageTypes.SET_GLOBAL_ITEM,
        data: {name, value, timestamp: new Date()},
    };
}

export function removeGlobalItem(name) {
    return (dispatch) => {
        dispatch({
            type: StorageTypes.REMOVE_GLOBAL_ITEM,
            data: {name},
        });
        return {data: true};
    };
}

export function clear(options = {exclude: []}) {
    return (dispatch) => {
        dispatch({
            type: StorageTypes.CLEAR,
            data: options,
        });
        return {data: true};
    };
}

export function actionOnGlobalItemsWithPrefix(prefix, action) {
    return {
        type: StorageTypes.ACTION_ON_GLOBAL_ITEMS_WITH_PREFIX,
        data: {prefix, action},
    };
}

// Temporary action to manually rehydrate drafts from localStorage.
export function rehydrateDrafts() {
    return (dispatch, getState) => {
        const actions = [];

        const state = getState();

        for (const [key, value] of Object.entries(localStorage)) {
            if (!key.startsWith(StoragePrefixes.DRAFT) && !key.startsWith(StoragePrefixes.COMMENT_DRAFT)) {
                continue;
            }

            const parsed = JSON.parse(value);

            const existing = getGlobalItem(state, key);
            if (existing && deepEqual(existing, parsed)) {
                continue;
            }

            actions.push(setGlobalItem(key, parsed));
        }

        if (actions.length === 0) {
            return {data: false};
        }

        return dispatch(batchActions(actions));
    };
}

export function storageRehydrate(incoming, persistor) {
    return (dispatch, getState) => {
        const state = getState();
        persistor.pause();
        Object.keys(incoming).forEach((key) => {
            const storage = {};
            try {
                const value = JSON.parse(incoming[key]);
                if (value === null) {
                    storage[key] = {value, timestamp: new Date()};
                } else if (typeof state.storage.storage[key] === 'undefined') {
                    if (typeof value.timestamp === 'undefined') {
                        storage[key] = {value, timestamp: new Date()};
                    } else {
                        storage[key] = {value: value.value, timestamp: new Date(value.timestamp)};
                    }
                } else if (typeof value.timestamp === 'undefined') {
                    storage[key] = {value, timestamp: new Date()};
                } else if (typeof state.storage.storage[key].timestamp === 'undefined') {
                    storage[key] = {value: value.value, timestamp: new Date(value.timestamp)};
                } else if (new Date(value.timestamp) > state.storage.storage[key].timestamp) {
                    storage[key] = {value: value.value, timestamp: new Date(value.timestamp)};
                } else {
                    return;
                }
            } catch (err) {
                if (process.env.NODE_ENV !== 'production') { // eslint-disable-line no-process-env
                    console.warn('Error rehydrating data for key "storage"', err); // eslint-disable-line no-console
                }
            }
            dispatch({
                type: StorageTypes.STORAGE_REHYDRATE,
                data: storage,
            });
        });

        persistor.resume();
        return {data: true};
    };
}
