// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import {t} from 'utils/i18n';
import {
    AnnouncementBarTypes, MappingCloudSelfHotsSkus, PaidFeatures, TELEMETRY_CATEGORIES,
} from 'utils/constants';

import {GlobalState} from 'types/store';
import AnnouncementBar from '../default_announcement_bar';
import useGetSubscription from 'components/common/hooks/useGetSubscription';
import {isSystemAdmin} from 'mattermost-redux/utils/user_utils';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {trackEvent} from 'actions/telemetry_actions';
import {getSubscriptionProduct} from 'mattermost-redux/selectors/entities/cloud';
import {useGetNotifyAdmin} from 'components/common/hooks/useGetNotifyAdmin';

//TODO Only display once using preferences
const NotifyAdminDowngradeDelinquencyBar = () => {
    const subscription = useGetSubscription();
    const product = useSelector(getSubscriptionProduct);
    const currentUser = useSelector((state: GlobalState) =>
        getCurrentUser(state),
    );

    const {btnText, notifyAdmin, notifyStatus} = useGetNotifyAdmin({
        ctaText: {
            id: 'cloud_delinquency.banner.end_user_notify_admin_button',
            defaultMessage: 'Notify admin',
        },
    });

    const buttonText = btnText(notifyStatus);

    const notifyAdminRequestData = {
        required_feature: PaidFeatures.UPGRADE_DOWNGRADE_WORKSPACE,
        required_plan: MappingCloudSelfHotsSkus[product?.sku || ''],
        trial_notification: false,
    };

    const shouldShowBanner = () => {
        if (!subscription) {
            return false;
        }

        if (isSystemAdmin(currentUser.roles)) {
            return false;
        }

        if (!subscription.delinquent_since) {
            return false;
        }

        const delinquencyDate = new Date(subscription.delinquent_since * 1000);

        const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        const today = new Date();
        const diffDays = Math.round(
            Math.abs((today.valueOf() - delinquencyDate.valueOf()) / oneDay),
        );

        return diffDays > 90;
    };

    if (!shouldShowBanner() || product == null) {
        return null;
    }

    const message = {
        id: t('cloud_delinquency.banner.end_user_notify_admin_title'),
        defaultMessage:
            'Your workspace has been downgraded.',
    };

    const handleClick = async () => {
        trackEvent(TELEMETRY_CATEGORIES.CLOUD_DELINQUENCY, 'click_notify_admin_upgrade');

        await notifyAdmin({
            requestData: notifyAdminRequestData,
            trackingArgs: {
                category: TELEMETRY_CATEGORIES.CLOUD_DELINQUENCY,
                event: 'notify_admin_downgrade_delinquency_bar',
                props: undefined,
            },
        });
    };

    return (
        <AnnouncementBar
            type={AnnouncementBarTypes.CRITICAL}
            showCloseButton={false}
            onButtonClick={handleClick}
            modalButtonText={buttonText.id}
            modalButtonDefaultText={buttonText.defaultMessage}
            message={<FormattedMessage {...message}/>}
            showLinkAsButton={true}
            isTallBanner={true}
            icon={<i className='icon icon-alert-outline'/>}
        />
    );
};

export default NotifyAdminDowngradeDelinquencyBar;
