// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {useSelector, useDispatch} from 'react-redux';

import {useEffect, useState, DependencyList} from 'react';

import {ActionResult} from 'mattermost-redux/types/actions';
import {getUser as fetchUser, getUserByUsername as fetchUserByUsername} from 'mattermost-redux/actions/users';
import {GlobalState} from 'types/store';

import {getUser, getUserByUsername} from 'mattermost-redux/selectors/entities/users';

import * as Utils from 'utils/utils';
import Constants from 'utils/constants';

import {UserProfile} from '@mattermost/types/users';
import {ClientError} from '@mattermost/client';

export const useUser = (userId: string | undefined) => {
    // @ts-expect-error `actionFunc` not distinguished between array/non-array data
    return useReduxThing(userId, fetchUser, getUser);
};

export const useUserIdFromUsername = (username: string): string | undefined => {
    const dispatch = useDispatch();
    const id = useSelector((state: GlobalState) => getUserByUsername(state, username)?.id);

    useEffect(() => {
        if (!id) {
            dispatch(fetchUserByUsername(username));
        }
    }, [username]);

    return id;
};

/**
 * Use thing from API and/or Store
 *
 * @param id The ID of the thing to fetch
 * @param fetchAction required redux action to fetch thing
 * @param select thing from store if available
 * @param deps additional deps that might be needed to trigger again the fetch func
 */
export const useReduxThing = <T extends NonNullable<any>>(
    id: string | undefined,
    fetchAction: (id: string) => Promise<ActionResult<T>> | ActionResult<T>,
    select: (state: GlobalState, id: string) => T | undefined = () => undefined,
    deps: DependencyList = [],
): [
    T | null,
    {isFetching: boolean; error: ClientError | null; isErrorCode: (code: number) => boolean},
] => {
    const dispatch = useDispatch();
    const [thing, setThing] = useState<T | null>(null);
    const thingFromState = useSelector<GlobalState, T | null>((state) => select?.(state, id || '') ?? null);
    const [error, setError] = useState<ClientError | null>(null);
    const [isFetching, setIsFetching] = useState<boolean>(true);

    useEffect(() => {
        (async () => {
            if (!id) {
                setIsFetching(false);
                setThing(null);
                setError(null);
                return;
            }

            if (thingFromState) {
                setThing(thingFromState);
                setIsFetching(false);
                return;
            }

            const {data, error: err} = await dispatch(fetchAction(id));

            if (err) {
                if (err instanceof ClientError) {
                    setError(err);
                }
                setThing(null);
            }

            if (data) {
                setThing(data);
            }

            setIsFetching(false);
        })();
    }, [thingFromState, id, ...deps]);

    const metadata = {
        isFetching,
        error,
        isErrorCode: (code: number) => {
            return error !== null && error.status_code === code;
        },
    };
    return [thing, metadata];
};

export const useUserDisplayMeta = (user: UserProfile | null | undefined) => {
    if (!user) {
        return {};
    }
    let name = Utils.getFullName(user);
    if (name && user.nickname) {
        name += ` (${user.nickname})`;
    } else if (user.nickname) {
        name = user.nickname;
    }

    const position = (user?.position || '').substring(
        0,
        Constants.MAX_POSITION_LENGTH,
    );

    const profileImageUrl = Utils.imageURLForUser(user.id, user.last_picture_update);

    return {
        name,
        position,
        profileImageUrl,
    };
};
