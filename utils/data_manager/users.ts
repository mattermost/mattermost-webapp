// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useDispatch, useSelector} from 'react-redux';
import {AnyAction} from 'redux';
import {
    all,
    put,
    takeEvery,
} from 'redux-saga/effects';

import {getUser} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';

import {getProfilesByIds} from 'mattermost-redux/actions/users';

import {useManager} from './context';
import {batchThrottle} from './saga_helpers';

export function useUser(userId: string) {
    const manager = useManager();
    const dispatch = useDispatch();

    const user = useSelector((state: GlobalState) => getUser(state, userId));

    if (user) {
        return user;
    }

    if (!manager.isSagaRunning('useUser')) {
        manager.runSaga('useUser', userSaga);
    }

    dispatch({
        type: 'FETCH_USER_BY_ID',
        userId,
    });

    return undefined;
}

function* doFetchUser(action: AnyAction) {
    let userIds = action.batched((a: AnyAction) => a.userId);
    userIds = Array.from(new Set(userIds));

    // TODO should this just call Client4 directly?
    yield put(getProfilesByIds(userIds) as any); // TODO it seems impossible to do this in TS without any
}

function* userSaga() {
    yield all([
        batchThrottle({
            incoming: 'FETCH_USER_BY_ID',
            outgoing: 'DO_FETCH_USERS_BY_IDS',
        }),
        takeEvery('DO_FETCH_USERS_BY_IDS', doFetchUser),
    ]);
}
