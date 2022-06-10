// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useState, useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {Limits} from '@mattermost/types/cloud';
import {cloudFreeEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getCloudLimits, getCloudLimitsLoaded} from 'mattermost-redux/selectors/entities/cloud';
import {getCloudLimits as getCloudLimitsAction} from 'actions/cloud';

export default function useGetLimits(): [Limits, boolean] {
    const isCloudFreeEnabled = useSelector(cloudFreeEnabled);
    const cloudLimits = useSelector(getCloudLimits);
    const cloudLimitsReceived = useSelector(getCloudLimitsLoaded);
    const dispatch = useDispatch();
    const [requestedLimits, setRequestedLimits] = useState(false);

    useEffect(() => {
        if (isCloudFreeEnabled && !requestedLimits && !cloudLimitsReceived) {
            dispatch(getCloudLimitsAction());
            setRequestedLimits(true);
        }
    }, [isCloudFreeEnabled, requestedLimits, cloudLimitsReceived]);

    const result: [Limits, boolean] = useMemo(() => {
        return [cloudLimits, cloudLimitsReceived];
    }, [cloudLimits, cloudLimitsReceived]);
    return result;
}
