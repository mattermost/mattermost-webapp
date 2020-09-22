// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {StorageTypes} from 'utils/constants';
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
    return (dispatch) => {
        dispatch({
            type: StorageTypes.SET_GLOBAL_ITEM,
            data: {name, value, timestamp: new Date()},
        });
        return {data: true};
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
    return (dispatch) => {
        dispatch({
            type: StorageTypes.ACTION_ON_GLOBAL_ITEMS_WITH_PREFIX,
            data: {prefix, action},
        });
        return {data: true};
    };
}

export function actionOnItemsWithPrefix(prefix, action) {
    return (dispatch, getState) => {
        const state = getState();
        const globalPrefix = getPrefix(state);
        dispatch({
            type: StorageTypes.ACTION_ON_ITEMS_WITH_PREFIX,
            data: {globalPrefix, prefix, action},
        });
        return {data: true};
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
