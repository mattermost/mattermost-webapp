// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useState, useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {Limits} from '@mattermost/types/cloud';
import {getCloudLimits, getCloudLimitsLoaded, isCurrentLicenseCloud} from 'mattermost-redux/selectors/entities/cloud';
import {getCloudLimits as getCloudLimitsAction} from 'actions/cloud';
import useGetSubscription from 'components/common/hooks/useGetSubscription';
import {useIsLoggedIn} from 'components/global_header/hooks';

const TIME_UNTIL_CACHE_PURGE_GUESS = 5000;

export default function useGetLimits(): [Limits, boolean] {
    const isCloud = useSelector(isCurrentLicenseCloud);
    const isLoggedIn = useIsLoggedIn();
    const cloudLimits = useSelector(getCloudLimits);
    const cloudLimitsReceived = useSelector(getCloudLimitsLoaded);
    const subscription = useGetSubscription();
    const dispatch = useDispatch();
    const [refreshCloudLimits, setRefreshCloudLimits] = useState(false);
    const [requestedLimits, setRequestedLimits] = useState(false);

    const ensureUpdatedData = () => {
        dispatch(getCloudLimitsAction());
    };

    useEffect(() => {
        const trialEnd = subscription?.trial_end_at ?? 0;
        const trialExpired = trialEnd !== 0 && trialEnd < Date.now();

        if (trialExpired) {
            setRefreshCloudLimits(true);
        }
    }, [subscription]);

    useEffect(() => {
        if (isLoggedIn && isCloud && ((!requestedLimits && !cloudLimitsReceived) || refreshCloudLimits)) {
            setTimeout(ensureUpdatedData, TIME_UNTIL_CACHE_PURGE_GUESS);
            setRequestedLimits(true);

            if (refreshCloudLimits) {
                setRefreshCloudLimits(false);
            }
        }
    }, [isLoggedIn, isCloud, requestedLimits, cloudLimitsReceived, refreshCloudLimits]);

    const result: [Limits, boolean] = useMemo(() => {
        return [cloudLimits, cloudLimitsReceived];
    }, [cloudLimits, cloudLimitsReceived]);
    return result;
}
