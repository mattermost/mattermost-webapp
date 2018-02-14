// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {getPrefix} from 'utils/storage_utils';

export const getGlobalItem = (state, name, defaultValue) => {
    const storage = state && state.storage && state.storage.storage;

    if (storage && typeof storage[name] !== 'undefined' && storage[name] !== null) {
        return storage[name];
    }

    return defaultValue;
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
    if (storage && typeof storage[name] !== 'undefined' && storage[name] !== null) {
        return storage[name];
    }

    return defaultValue;
};
