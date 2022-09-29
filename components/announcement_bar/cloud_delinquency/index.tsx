// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import {t} from 'utils/i18n';
import {
    AnnouncementBarTypes, TELEMETRY_CATEGORIES,
} from 'utils/constants';

import {GlobalState} from 'types/store';
import AnnouncementBar from '../default_announcement_bar';
import useGetSubscription from 'components/common/hooks/useGetSubscription';
import {isSystemAdmin} from 'mattermost-redux/utils/user_utils';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import useOpenCloudPurchaseModal from 'components/common/hooks/useOpenCloudPurchaseModal';
import {trackEvent} from 'actions/telemetry_actions';

const CloudDelinquencyAnnouncementBar = () => {
    const subscription = useGetSubscription();
    const openPurchaseModal = useOpenCloudPurchaseModal({});
    const currentUser = useSelector((state: GlobalState) =>
        getCurrentUser(state),
    );

    const shouldShowBanner = () => {
        if (!subscription) {
            return false;
        }

        if (!isSystemAdmin(currentUser.roles)) {
            return false;
        }

        if (!subscription.delinquent_since) {
            return false;
        }

        return true;
    };

    const getBannerType = () => {
        const delinquencyDate = new Date(
            (subscription?.delinquent_since || 0) * 1000,
        );

        const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        const today = new Date();
        const diffDays = Math.round(
            Math.abs((today.valueOf() - delinquencyDate.valueOf()) / oneDay),
        );
        if (diffDays > 90) {
            return AnnouncementBarTypes.CRITICAL;
        }
        return AnnouncementBarTypes.ADVISOR;
    };

    if (!shouldShowBanner()) {
        return null;
    }

    const message = {
        id: t('cloud_delinquency.banner.title'),
        defaultMessage:
            'Update your billing information now to keep paid features.',
    };

    return (
        <AnnouncementBar
            type={getBannerType()}
            showCloseButton={false}
            onButtonClick={() => {
                trackEvent(TELEMETRY_CATEGORIES.CLOUD_DELINQUENCY, 'click_update_billing');
                openPurchaseModal({
                    trackingLocation:
                        'cloud_delinquency_announcement_bar',
                });
            }
            }
            modalButtonText={t('cloud_delinquency.banner.buttonText')}
            modalButtonDefaultText={'Update billing now'}
            message={<FormattedMessage {...message}/>}
            showLinkAsButton={true}
            isTallBanner={true}
            icon={<i className='icon icon-alert-outline'/>}
        />
    );
};

export default CloudDelinquencyAnnouncementBar;
