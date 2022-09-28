// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useMemo, useEffect} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {getStatusesByIdsBatchedDebounced} from 'mattermost-redux/actions/users';
import {getStatusForUserId} from 'mattermost-redux/selectors/entities/users';

import {makeGetCustomStatus, isCustomStatusEnabled, isCustomStatusExpired} from 'selectors/views/custom_status';
import {GlobalState} from 'types/store';

import {UserProfile} from '@mattermost/types/users';

export const useUserCustomStatus = (userId: UserProfile['id'] | undefined | null) => {
    const getCustomStatus = useMemo(makeGetCustomStatus, []);
    return useSelector((state: GlobalState) => {
        const customStatus = userId && getCustomStatus(state, userId);

        if (
            !customStatus ||
            !isCustomStatusEnabled(state) ||
            isCustomStatusExpired(state, customStatus)
        ) {
            return null;
        }

        return customStatus;
    });
};

export const useUserStatus = (userId: UserProfile['id'] | undefined | null) => {
    const dispatch = useDispatch();
    const status = useSelector((state: GlobalState) => {
        const status = userId && getStatusForUserId(state, userId);

        if (!status) {
            return null;
        }

        return status;
    });

    useEffect(() => {
        if (userId && !status) {
            dispatch(getStatusesByIdsBatchedDebounced(userId));
        }
    }, [userId]);

    return status;
};
