// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useState} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {GlobalState} from 'types/store';
import {LicenseExpandReducer} from '@mattermost/types/cloud';
import {trackEvent} from 'actions/telemetry_actions.jsx';
import {getExpandSeatsLink} from 'selectors/cloud';
import {getLicenseExpandStatus} from 'mattermost-redux/actions/cloud';

type UseExpandOverageUsersCheckArgs = {
    isWarningState: boolean;
    shouldRequest: boolean;
    licenseId?: string;
    banner: 'global banner' | 'invite modal';
}

export const useExpandOverageUsersCheck = ({
    shouldRequest,
    isWarningState,
    licenseId,
    banner,
}: UseExpandOverageUsersCheckArgs) => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();
    const {getRequestState, is_expandable: isExpendable}: LicenseExpandReducer = useSelector((state: GlobalState) => state.entities.cloud.subscriptionStats || {is_expandable: false, getRequestState: 'IDLE'});
    const expandableLink = useSelector(getExpandSeatsLink);
    const [cta, setCTA] = useState(formatMessage({
        id: 'licensingPage.overageUsersBanner.cta',
        defaultMessage: 'Contact Sales',
    }));

    const trackEventFn = (cta: 'Contact Sales' | 'Self Serve') => {
        trackEvent('insights', isWarningState ? 'click_true_up_warning' : 'click_true_up_error', {
            cta,
            banner,
        });
    };

    useEffect(() => {
        if (shouldRequest && licenseId && getRequestState === 'IDLE') {
            dispatch(getLicenseExpandStatus());
        }
    }, [dispatch, getRequestState, licenseId, shouldRequest]);

    useEffect(() => {
        if (getRequestState === 'IDLE' || getRequestState === 'LOADING') {
            return;
        }

        if (isExpendable) {
            setCTA(formatMessage({
                id: 'licensingPage.overageUsersBanner.ctaExpandSeats',
                defaultMessage: 'Purchase additional seats',
            }));
        } else {
            setCTA(formatMessage({
                id: 'licensingPage.overageUsersBanner.cta',
                defaultMessage: 'Contact Sales',
            }));
        }
    }, [isExpendable, getRequestState, setCTA, formatMessage]);

    return {
        cta,
        expandableLink,
        trackEventFn,
        getRequestState,
        isExpendable,
    };
};
