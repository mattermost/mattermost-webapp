// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {getPrefix} from 'utils/storage_utils';

function getGlobalItem(state, name, defaultValue) {
    if (state && state.storage && typeof state.storage[name] !== 'undefined' && state.storage[name] !== null) {
        return state.storage[name];
    }
    return defaultValue;
}

export function makeGetItem(name, defaultValue) {
    return (state) => {
        return getGlobalItem(state, getPrefix(state) + name, defaultValue);
    };
}

export function makeGetGlobalItem(name, defaultValue) {
    return (state) => {
        return getGlobalItem(state, name, defaultValue);
    };
}

export function getItemFromStorage(storage, name, defaultValue) {
    if (storage && typeof storage[name] !== 'undefined' && storage[name] !== null) {
        return storage[name];
    }
    return defaultValue;
}
