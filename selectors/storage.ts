// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Dictionary} from 'mattermost-redux/types/utilities';

import {getPrefix} from 'utils/storage_utils';

import type {GlobalState} from 'types/store';

export const getGlobalItem = (state: GlobalState, name: string, defaultValue: any) => {
    const storage = state && state.storage && state.storage.storage;

    return getItemFromStorage(storage, name, defaultValue);
};

export const getItem = (state: GlobalState, name: string, defaultValue: any) => {
    return getGlobalItem(state, getPrefix(state) + name, defaultValue);
};

export const makeGetItem = (name: string, defaultValue: any) => {
    return (state: GlobalState) => {
        return getItem(state, name, defaultValue);
    };
};

export const makeGetGlobalItem = (name: string, defaultValue: any) => {
    return (state: GlobalState) => {
        return getGlobalItem(state, name, defaultValue);
    };
};

export const getItemFromStorage = (storage: Dictionary<any>, name: string, defaultValue: any) => {
    if (storage &&
        typeof storage[name] !== 'undefined' &&
        storage[name] !== null &&
        typeof storage[name].value !== 'undefined' &&
        storage[name].value !== null) {
        return storage[name].value;
    }

    return defaultValue;
};
