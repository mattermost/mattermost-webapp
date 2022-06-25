// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {useSelector, useDispatch} from 'react-redux';

import {useEffect} from 'react';

import {getUserByUsername as fetchUser} from 'mattermost-redux/actions/users';
import {GlobalState} from 'types/store';
import {ActionFunc} from 'mattermost-redux/types/actions';
import {getUserByUsername} from 'mattermost-redux/selectors/entities/users';

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
function useReduxThing<T extends NonNullable<any>>(
    id: string,
    fetch: (id: string) => ActionFunc,
    select?: (state: GlobalState, id: string) => T,
) {
    const dispatch = useDispatch();
    const thingFromState = useSelector<GlobalState, T | null>((state) => select?.(state, id || '') ?? null);

    useEffect(() => {
        if (id) {
            dispatch(fetch(id));
        }
    }, [id]);

    return thingFromState;
}
