// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Dictionary} from 'mattermost-redux/types/utilities';

import {getPrefix} from 'utils/storage_utils';

import type {GlobalState} from 'types/store';

export const getGlobalItem = <T = any>(state: GlobalState, name: string, defaultValue: T) => {
    const storage = state && state.storage && state.storage.storage;

    return getItemFromStorage(storage, name, defaultValue);
};

export const getItem = <T = any>(state: GlobalState, name: string, defaultValue: T) => {
    return getGlobalItem(state, getPrefix(state) + name, defaultValue);
};

export const makeGetItem = <T = any>(name: string, defaultValue: T) => {
    return (state: GlobalState) => {
        return getItem(state, name, defaultValue);
    };
};

export const makeGetGlobalItem = <T = any>(name: string, defaultValue: T) => {
    return (state: GlobalState) => {
        return getGlobalItem(state, name, defaultValue);
    };
};

export const getItemFromStorage = <T = any>(storage: Dictionary<any>, name: string, defaultValue: T) => {
    if (storage &&
        typeof storage[name] !== 'undefined' &&
        storage[name] !== null &&
        typeof storage[name].value !== 'undefined' &&
        storage[name].value !== null) {
        return storage[name].value;
    }

    return defaultValue;
};
