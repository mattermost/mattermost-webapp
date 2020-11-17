// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';
import {General} from 'mattermost-redux/constants';

import {StorageTypes} from 'utils/constants';

function storage(state = {}, action) {
    var key;

    switch (action.type) {
    case StorageTypes.SET_ITEM: {
        if (!state[action.data.prefix + action.data.name] ||
            !state[action.data.prefix + action.data.name].timestamp ||
            state[action.data.prefix + action.data.name].timestamp < action.data.timestamp
        ) {
            const nextState = {...state};
            nextState[action.data.prefix + action.data.name] = {
                timestamp: action.data.timestamp,
                value: action.data.value,
            };
            return nextState;
        }
        return state;
    }
    case StorageTypes.REMOVE_ITEM: {
        const nextState = {...state};
        Reflect.deleteProperty(nextState, action.data.prefix + action.data.name);
        return nextState;
    }
    case StorageTypes.SET_GLOBAL_ITEM: {
        if (!state[action.data.name] ||
            !state[action.data.name].timestamp ||
            state[action.data.name].timestamp < action.data.timestamp
        ) {
            const nextState = {...state};
            nextState[action.data.name] = {
                timestamp: action.data.timestamp,
                value: action.data.value,
            };
            return nextState;
        }
        return state;
    }
    case StorageTypes.REMOVE_GLOBAL_ITEM: {
        const nextState = {...state};
        Reflect.deleteProperty(nextState, action.data.name);
        return nextState;
    }
    case StorageTypes.CLEAR: {
        const cleanState = {};
        if (action.data && action.data.exclude && action.data.exclude.forEach) {
            action.data.exclude.forEach((excluded) => {
                if (state[excluded]) {
                    cleanState[excluded] = state[excluded];
                }
            });
        }
        return cleanState;
    }
    case StorageTypes.ACTION_ON_GLOBAL_ITEMS_WITH_PREFIX: {
        const nextState = {...state};
        for (key in state) {
            if (key.lastIndexOf(action.data.prefix, 0) === 0) {
                nextState[key] = {
                    timestamp: new Date(),
                    value: action.data.action(key, state[key].value),
                };
            }
        }
        return nextState;
    }
    case StorageTypes.ACTION_ON_ITEMS_WITH_PREFIX: {
        const nextState = {...state};
        var globalPrefix = action.data.globalPrefix;
        var globalPrefixLen = action.data.globalPrefix.length;
        for (key in state) {
            if (key.lastIndexOf(globalPrefix + action.data.prefix, 0) === 0) {
                var userkey = key.substring(globalPrefixLen);
                nextState[key] = {
                    timestamp: new Date(),
                    value: action.data.action(userkey, state[key].value),
                };
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

function initialized(state = false, action) {
    switch (action.type) {
    case General.STORE_REHYDRATION_COMPLETE:
        return state || action.complete;

    default:
        return state;
    }
}

export default combineReducers({
    storage,
    initialized,
});
