// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useMemo} from 'react';
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
    const {getRequestState, is_expandable: isExpandable}: LicenseExpandReducer = useSelector((state: GlobalState) => state.entities.cloud.subscriptionStats || {is_expandable: false, getRequestState: 'IDLE'});
    const expandableLink = useSelector(getExpandSeatsLink);

    const cta = useMemo(() => (isExpandable ?
        formatMessage({
            id: 'licensingPage.overageUsersBanner.ctaExpandSeats',
            defaultMessage: 'Purchase additional seats',
        }) :
        formatMessage({
            id: 'licensingPage.overageUsersBanner.cta',
            defaultMessage: 'Contact Sales',
        })
    ), [isExpandable]);

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

    return {
        cta,
        expandableLink,
        trackEventFn,
        getRequestState,
        isExpandable,
    };
};
