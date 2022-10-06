// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import {t} from 'utils/i18n';
import {AnnouncementBarTypes, LegacyFreeProductIds} from 'utils/constants';

import AnnouncementBar from '../default_announcement_bar';

import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import useGetSubscription from 'components/common/hooks/useGetSubscription';
import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';

const LegacyMattermostCloudBar = () => {
    const isLegacyMattermostCloud = Boolean(LegacyFreeProductIds[useGetSubscription()?.product_id || '']);
    const isAdmin = useSelector(isCurrentUserSystemAdmin);
    const openPricingModal = useOpenPricingModal();

    if (!isAdmin || !isLegacyMattermostCloud) {
        return null;
    }

    const message = {
        id: t('legacy_mattermost_cloud_migration'),
        defaultMessage: 'Your legacy plan will no longer be supported starting November 1, 2022. <a>Update your plan now.</a>',
        values: {
            a: (chunks: React.ReactNode) => {
                return (
                    <a
                        href='#'
                        onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            openPricingModal({
                                trackingLocation: 'legacy_mattermost_cloud_bar',
                            });
                        }}
                    >
                        {chunks}
                    </a>
                );
            },
        },
    };

    return (
        <AnnouncementBar
            type={AnnouncementBarTypes.CRITICAL}
            showCloseButton={false}
            message={<FormattedMessage {...message}/>}
            icon={<i className='icon icon-alert-outline'/>}
        />
    );
};

export default LegacyMattermostCloudBar;
