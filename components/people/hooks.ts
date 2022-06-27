// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {useSelector, useDispatch} from 'react-redux';

import {useEffect} from 'react';

import {getUserByUsername as fetchUser, patchUser} from 'mattermost-redux/actions/users';
import {GlobalState} from 'types/store';
import {ActionFunc} from 'mattermost-redux/types/actions';
import {getCurrentUserId, getUser, getUserByUsername} from 'mattermost-redux/selectors/entities/users';

export function useUser(username: string) {
    return useReduxThing(username, fetchUser, getUserByUsername);
}

/**
 * Use thing from API and/or Store
 *
 * @param fetch required thing fetcher
 * @param select thing from store if available
 *
 * @returns undefined == loading; null == not found
 */
export const useReduxThing = <T extends NonNullable<any>>(
    id: string,
    fetch: (id: string) => ActionFunc,
    select?: (state: GlobalState, id: string) => T,
) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (id) {
            dispatch(fetch(id));
        }
    }, [id]);

    return useSelector<GlobalState, T | null>((state) => select?.(state, id || '') ?? null);
};

export const useUserProfileProp = (
    key: string,
    userId: string | undefined,
    defaultValue = '',
): [string, (val: string) => void] => {
    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);
    const canChange = currentUserId === userId;
    const user = useSelector((state: GlobalState) => (userId ? getUser(state, userId) : null));
    const currentValue = user?.profile_props?.[key] ?? defaultValue;

    const setValue = (value = currentValue) => {
        if (canChange) {
            dispatch(patchUser({...user, profile_props: {...user?.profile_props, [key]: value}}));
        }
    };

    return [currentValue, setValue];
};
