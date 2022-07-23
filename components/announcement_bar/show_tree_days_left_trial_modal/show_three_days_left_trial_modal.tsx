// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import moment from 'moment';

import {DispatchFunc} from 'mattermost-redux/types/actions';

import {get as getPreference} from 'mattermost-redux/selectors/entities/preferences';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {getCloudSubscription} from 'mattermost-redux/selectors/entities/cloud';
import {getLicense} from 'mattermost-redux/selectors/entities/general';

import useGetHighestThresholdCloudLimit from 'components/common/hooks/useGetHighestThresholdCloudLimit';

import {openModal} from 'actions/views/modals';
import {GlobalState} from 'types/store';

import {
    Preferences,
    TELEMETRY_CATEGORIES,
    ModalIdentifiers,
    CloudBanners,
} from 'utils/constants';

import ThreeDaysLeftTrialModal from 'components/three_days_left_trial_modal/three_days_left_trial_modal';
import useGetLimits from 'components/common/hooks/useGetLimits';
import useGetUsage from 'components/common/hooks/useGetUsage';

import {trackEvent} from 'actions/telemetry_actions';

const ShowThreeDaysLeftTrialModal = () => {
    const license = useSelector(getLicense);
    const isCloud = license?.Cloud === 'true';
    const isUserAdmin = useSelector((state: GlobalState) => isCurrentUserSystemAdmin(state));
    const subscription = useSelector(getCloudSubscription);
    const isFreeTrial = subscription?.is_free_trial === 'true';

    const dispatch = useDispatch<DispatchFunc>();
    const hadAdminDismissedModal = useSelector((state: GlobalState) => getPreference(state, Preferences.CLOUD_TRIAL_BANNER, CloudBanners.THREE_DAYS_LEFT_TRIAL_MODAL)) === 'true';

    const trialEndDate = new Date(subscription?.trial_end_at || 0);

    const today = moment();
    const formattedEndDate = moment(Number(trialEndDate || 0));
    const diffDays = formattedEndDate.diff(today, 'days');

    // the trial will end in three days or left
    const trialEndInThreeDaysOrLess = diffDays <= 3;

    // validate the logic for the limits and pass that to the modal as a property
    const someLimitNeedsAttention = Boolean(useGetHighestThresholdCloudLimit(useGetUsage(), useGetLimits()[0]));

    useEffect(() => {
        if (subscription?.trial_end_at === undefined || subscription.trial_end_at === 0) {
            return;
        }

        if (isCloud && isFreeTrial && isUserAdmin && !hadAdminDismissedModal && trialEndInThreeDaysOrLess) {
            dispatch(openModal({
                modalId: ModalIdentifiers.THREE_DAYS_LEFT_TRIAL_MODAL,
                dialogType: ThreeDaysLeftTrialModal,
                dialogProps: {limitsOVerpassed: someLimitNeedsAttention},
            }));
            trackEvent(
                TELEMETRY_CATEGORIES.CLOUD_THREE_DAYS_LEFT_MODAL,
                'trigger_cloud_three_days_left_modal',
            );
        }
    }, [subscription?.trial_end_at]);

    return null;
};
export default ShowThreeDaysLeftTrialModal;
