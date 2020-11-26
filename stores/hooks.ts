// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useState, useEffect} from 'react';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {useSelector} from 'react-redux';
import {createSelector} from 'reselect';

import LocalStorageStore from './local_storage_store';

export const defaultPrefixSelector = createSelector([
    getCurrentTeamId,
    getCurrentUserId,
], (teamId, userId) => {
    return `${teamId}:${userId}:`;
});

export function useStickyState(defaultValue: any, key: string, prefix = useSelector(defaultPrefixSelector)) {
    const prefixedKey = prefix + key;
    const [value, setValue] = useState(() => {
        const state = LocalStorageStore.getItem(prefixedKey);
        if (state == null) {
            return defaultValue;
        }
        return JSON.parse(state);
    });
    useEffect(() => {
        LocalStorageStore.setItem(prefixedKey, JSON.stringify(value));
    }, [key, value]);
    return [value, setValue];
}
