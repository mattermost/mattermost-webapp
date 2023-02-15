// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {getCloudLimits, getCloudLimitsLoaded, getSubscriptionProduct, isCurrentLicenseCloud} from 'mattermost-redux/selectors/entities/cloud';
import {getCloudLimits as getCloudLimitsAction} from 'actions/cloud';
import {useIsLoggedIn} from 'components/global_header/hooks';

import {Limits} from '@mattermost/types/cloud';

export default function useGetLimits(): [Limits, boolean] {
    const isCloud = useSelector(isCurrentLicenseCloud);
    const isLoggedIn = useIsLoggedIn();
    const cloudLimits = useSelector(getCloudLimits);
    const subscriptionProduct = useSelector(getSubscriptionProduct);
    const cloudLimitsReceived = useSelector(getCloudLimitsLoaded);
    const dispatch = useDispatch();

    useEffect(() => {
        if (isLoggedIn && isCloud) {
            dispatch(getCloudLimitsAction());
        }
    }, [isLoggedIn, isCloud, subscriptionProduct]);

    const result: [Limits, boolean] = useMemo(() => {
        return [cloudLimits, cloudLimitsReceived];
    }, [cloudLimits, subscriptionProduct]);
    return result;
}
