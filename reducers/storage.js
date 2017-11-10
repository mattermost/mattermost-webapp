// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {StorageTypes} from 'utils/constants';

export default function storage(state = {}, action) {
    const nextState = {...state};
    var key;

    switch (action.type) {
    case StorageTypes.SET_ITEM: {
        nextState[action.data.prefix + action.data.name] = action.data.value;
        return nextState;
    }
    case StorageTypes.REMOVE_ITEM: {
        Reflect.deleteProperty(nextState, action.data.prefix + action.data.name);
        return nextState;
    }
    case StorageTypes.SET_GLOBAL_ITEM: {
        nextState[action.data.name] = action.data.value;
        return nextState;
    }
    case StorageTypes.REMOVE_GLOBAL_ITEM: {
        Reflect.deleteProperty(nextState, action.data.name);
        return nextState;
    }
    case StorageTypes.CLEAR: {
        var cleanState = {};
        action.data.exclude.forEach((excluded) => {
            if (state[excluded]) {
                cleanState[excluded] = state[excluded];
            }
        });
        return cleanState;
    }
    case StorageTypes.ACTION_ON_GLOBAL_ITEMS_WITH_PREFIX: {
        for (key in state) {
            if (key.lastIndexOf(action.data.prefix, 0) === 0) {
                nextState[key] = action.data.action(key, state[key]);
            }
        }
        return nextState;
    }
    case StorageTypes.ACTION_ON_ITEMS_WITH_PREFIX: {
        var globalPrefix = action.data.globalPrefix;
        var globalPrefixLen = action.data.globalPrefix.length;
        for (key in state) {
            if (key.lastIndexOf(globalPrefix + action.data.prefix, 0) === 0) {
                var userkey = key.substring(globalPrefixLen);
                nextState[key] = action.data.action(userkey, state[key]);
            }
        }
        return nextState;
    }
    case StorageTypes.STORAGE_REHYDRATE: {
        return {...state, ...action.data};
    }
    default:
        return state;
    }
}
