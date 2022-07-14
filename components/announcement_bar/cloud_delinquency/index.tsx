// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import {useHistory} from 'react-router-dom';

import {t} from 'utils/i18n';
import {
    AnnouncementBarTypes,
} from 'utils/constants';

import {GlobalState} from 'types/store';
import AnnouncementBar from '../default_announcement_bar';
import useGetSubscription from 'components/common/hooks/useGetSubscription';
import {isSystemAdmin} from 'mattermost-redux/utils/user_utils';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

const CloudDelinquencyAnnouncementBar: React.FC = () => {
    const subscription = useGetSubscription();
    const history = useHistory();

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
            'Update your billing information now to keep using paid features.',
    };

    return (
        <AnnouncementBar
            type={getBannerType()}
            showCloseButton={false}
            onButtonClick={() => {
                history.push('/admin_console/billing/payment_info');
            }}
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
