// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {StorageTypes} from 'utils/constants';
import {getPrefix} from 'utils/storage_utils';

export function setItem(name, value) {
    return async (dispatch, getState) => {
        const state = getState();
        const prefix = getPrefix(state);
        dispatch({
            type: StorageTypes.SET_ITEM,
            data: {prefix, name, value}
        }, getState);
        return {data: true};
    };
}

export function removeItem(name) {
    return async (dispatch, getState) => {
        const state = getState();
        const prefix = getPrefix(state);
        dispatch({
            type: StorageTypes.REMOVE_ITEM,
            data: {prefix, name}
        }, getState);
        return {data: true};
    };
}

export function setGlobalItem(name, value) {
    return async (dispatch, getState) => {
        dispatch({
            type: StorageTypes.SET_GLOBAL_ITEM,
            data: {name, value}
        }, getState);
        return {data: true};
    };
}

export function removeGlobalItem(name) {
    return async (dispatch, getState) => {
        dispatch({
            type: StorageTypes.REMOVE_GLOBAL_ITEM,
            data: {name}
        }, getState);
        return {data: true};
    };
}

export function clear(options) {
    return async (dispatch, getState) => {
        dispatch({
            type: StorageTypes.CLEAR,
            data: options
        }, getState);
        return {data: true};
    };
}

export function actionOnGlobalItemsWithPrefix(prefix, action) {
    return async (dispatch, getState) => {
        dispatch({
            type: StorageTypes.ACTION_ON_GLOBAL_ITEMS_WITH_PREFIX,
            data: {prefix, action}
        }, getState);
        return {data: true};
    };
}

export function actionOnItemsWithPrefix(prefix, action) {
    return async (dispatch, getState) => {
        const state = getState();
        const globalPrefix = getPrefix(state);
        dispatch({
            type: StorageTypes.ACTION_ON_ITEMS_WITH_PREFIX,
            data: {globalPrefix, prefix, action}
        }, getState);
        return {data: true};
    };
}

export function storageRehydrate(incoming) {
    return async (dispatch, getState) => {
        if (incoming.storage) {
            let storage = {}
            try {
                storage = JSON.parse(incoming.storage)
            } catch (err) {
                if (process.env.NODE_ENV !== 'production') console.warn(`Error rehydrating data for key "storage"`, err)
            }
            dispatch({
                type: StorageTypes.STORAGE_REHYDRATE,
                data: storage
            });
        }
        return {data: true};
    };
}
