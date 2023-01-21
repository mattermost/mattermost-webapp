// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useCallback} from 'react';
import {useSelector, useDispatch, shallowEqual} from 'react-redux';

import {createSelector} from 'reselect';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {getGlobalItem, makeGetGlobalItem} from 'selectors/storage';
import {setGlobalItem} from 'actions/storage';
import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

export const currentUserAndTeamSuffix = createSelector('currentUserAndTeamSuffix', [
    getCurrentUserId,
    getCurrentTeamId,
], (
    userId,
    teamId,
) => {
    return `:${userId}:${teamId}`;
});

export const currentUserSuffix = createSelector('currentUserSuffix', [
    getCurrentUserId,
], (
    userId,
) => {
    return `:${userId}`;
});

/**
 *
 * @param initialValue
 * @param name name of stored value, prepended to suffix
 * @param suffix to provide scope; defaults to user and team
 */
export function useGlobalState<TVal>(
    initialValue: TVal,
    name: string,
): [TVal, React.Dispatch<React.SetStateAction<TVal>>] {
    const dispatch = useDispatch();
    const suffix = useSelector(currentUserAndTeamSuffix);
    const storedKey = `${name}${suffix}`;

    const value = useSelector(makeGetGlobalItem(storedKey, initialValue), shallowEqual);
    const setValue = useCallback((update) => {
        return dispatch((dispatch: DispatchFunc, getState: GetStateFunc) => {
            const v = getGlobalItem(getState(), storedKey, initialValue);
            dispatch(setGlobalItem(storedKey, resolve(update, v)));
        });
    }, [storedKey]);

    return [
        value,
        setValue,
    ];
}

type ResolvableFunction<TVal> = (...TArgs: any) => TVal;

export type Resolvable<TVal> = ResolvableFunction<TVal> | TVal;

export function resolve<TVal>(prop: Resolvable<TVal>, ...args: any): TVal {
    return typeof prop === 'function' ? (prop as ResolvableFunction<TVal>)(...args) : prop;
}

