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

export function actionOnGlobalItemsWithPrefix(prefix, action) {
    return {
        type: StorageTypes.ACTION_ON_GLOBAL_ITEMS_WITH_PREFIX,
        data: {prefix, action},
    };
}
