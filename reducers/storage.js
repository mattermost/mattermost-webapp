// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';
import {General} from 'mattermost-redux/constants';

import {StorageTypes} from 'utils/constants';

function storage(state = {}, action) {
    var key;

    switch (action.type) {
    case StorageTypes.SET_ITEM: {
        const nextState = {...state};
        if (!nextState[action.data.prefix + action.data.name] ||
            !nextState[action.data.prefix + action.data.name].timestamp ||
            nextState[action.data.prefix + action.data.name].timestamp < action.data.timestamp
        ) {
            nextState[action.data.prefix + action.data.name] = {
                timestamp: action.data.timestamp,
                value: action.data.value,
            };
        }
        return nextState;
    }
    case StorageTypes.REMOVE_ITEM: {
        const nextState = {...state};
        Reflect.deleteProperty(nextState, action.data.prefix + action.data.name);
        return nextState;
    }
    case StorageTypes.SET_GLOBAL_ITEM: {
        const nextState = {...state};
        if (!nextState[action.data.name] ||
            !nextState[action.data.name].timestamp ||
            nextState[action.data.name].timestamp < action.data.timestamp
        ) {
            nextState[action.data.name] = {
                timestamp: action.data.timestamp,
                value: action.data.value,
            };
        }
        return nextState;
    }
    case StorageTypes.REMOVE_GLOBAL_ITEM: {
        const nextState = {...state};
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
        const nextState = {...state};
        for (key in state) {
            if (key.lastIndexOf(action.data.prefix, 0) === 0) {
                if (state[key].timestamp) {
                    nextState[key] = {
                        timestamp: new Date(),
                        value: action.data.action(key, state[key].value),
                    };
                } else {
                    nextState[key] = {
                        timestamp: new Date(),
                        value: action.data.action(key, state[key]),
                    };
                }
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
                if (state[key].timestamp) {
                    nextState[key] = {
                        timestamp: new Date(),
                        value: action.data.action(userkey, state[key].value),
                    };
                } else {
                    nextState[key] = {
                        timestamp: new Date(),
                        value: action.data.action(userkey, state[key]),
                    };
                }
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
