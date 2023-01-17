// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {getCloudLimits as getCloudLimitsAction} from 'actions/cloud';
import {
    getCloudSubscription as getCloudSubscriptionAction,
} from 'mattermost-redux/actions/cloud';
import {getLicense} from 'mattermost-redux/selectors/entities/general';

import {Subscription} from '@mattermost/types/cloud';
import {getCloudSubscription} from 'mattermost-redux/selectors/entities/cloud';

const TIME_UNTIL_CACHE_PURGE_GUESS = 5000;

export default function useGetSubscription(): Subscription | undefined {
    const cloudSubscription = useSelector(getCloudSubscription);
    const license = useSelector(getLicense);
    const retrievedCloudSub = Boolean(cloudSubscription);
    const dispatch = useDispatch();
    const [requestedSubscription, setRequestedSubscription] = useState(false);
    const [updatedSubscription, setUpdatedSubscription] = useState(false);

    const ensureUpdatedData = () => {
        dispatch(getCloudLimitsAction());
    };

    useEffect(() => {
        if (license?.Cloud === 'true') {
            if (!retrievedCloudSub && !requestedSubscription) {
                dispatch(getCloudSubscriptionAction());
                setRequestedSubscription(true);
            }

            const trialEnd = cloudSubscription?.trial_end_at ?? 0;
            const trialExpired = trialEnd !== 0 && trialEnd < Date.now();

            if (!updatedSubscription && trialExpired) {
                setTimeout(ensureUpdatedData, TIME_UNTIL_CACHE_PURGE_GUESS);

                setUpdatedSubscription(true);
            }
        }
    }, [requestedSubscription, retrievedCloudSub, license, cloudSubscription?.trial_end_at, updatedSubscription]);

    return cloudSubscription;
}
