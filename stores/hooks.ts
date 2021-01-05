// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useState} from 'react';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {useSelector} from 'react-redux';
import {createSelector} from 'reselect';

import LocalStorageStore from './local_storage_store';

export const defaultSuffixSelector = createSelector([
    getCurrentUserId,
    getCurrentTeamId,
], (
    userId,
    teamId,
) => {
    return `:${userId}:${teamId}`;
});

/**
 *
 * @param initialValue
 * @param key key of stored value, appended to prefix
 * @param suffix to provide scope, defaults to user and team
 */
export function useStickyState<TVal>(
    initialValue: TVal,
    key: string,
    suffix: string = useSelector(defaultSuffixSelector),
): [TVal, (value: TVal | ((val: TVal) => TVal)) => void] {
    const storedKey = key + suffix;

    const [storedValue, setStoredValue] = useState<TVal>(() => {
        try {
            const item = LocalStorageStore.getItem(storedKey);
            return item == null ? initialValue : JSON.parse(item);
        } catch (error) {
            return initialValue;
        }
    });

    const setValue = (value: TVal | ((val: TVal) => TVal)) => {
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);
        LocalStorageStore.setItem(storedKey, JSON.stringify(valueToStore));
    };

    return [storedValue, setValue];
}
