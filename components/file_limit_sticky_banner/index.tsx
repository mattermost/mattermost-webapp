// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useState} from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {getCurrentUser, isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {get as selectPreference} from 'mattermost-redux/selectors/entities/preferences';
import {isCurrentLicenseCloud, getSubscriptionProduct as selectSubscriptionProduct} from 'mattermost-redux/selectors/entities/cloud';
import {savePreferences} from 'mattermost-redux/actions/preferences';

import {GlobalState} from 'types/store';

import useGetUsage from 'components/common/hooks/useGetUsage';
import useGetLimits from 'components/common/hooks/useGetLimits';
import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import NotifyAdminCTA from 'components/notify_admin_cta/notify_admin_cta';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import Constants, {CloudProducts, LicenseSkus, PaidFeatures, Preferences} from 'utils/constants';
import {asGBString} from 'utils/limits';

interface FileLimitSnoozePreference {
    lastSnoozeTimestamp: number;
}

const snoozeCoolOffDays = 10;
const snoozeCoolOffDaysMillis = snoozeCoolOffDays * 24 * 60 * 60 * 1000;

const StyledDiv = styled.div`
width: 100%;
padding: 0 24px;
margin: 12px auto;
`;

const InnerDiv = styled.div`
position: relative;
border: 1px solid #FFBC1F;
border-radius: 4px;
background: linear-gradient(0deg, rgba(255, 212, 112, 0.16), rgba(255, 212, 112, 0.16)), #FFFFFF;
padding: 16px 17px;
color: var(--center-channel-color);
`;

const CloseIcon = styled.button`
border: none;
outline: none;
background: none;
position: absolute;
top: 16px;
right: 0;
`;

const StyledI = styled.i`
color: #FFBC1F;
`;

function FileLimitStickyBanner() {
    const [show, setShow] = useState(true);
    const {formatMessage, formatNumber} = useIntl();
    const dispatch = useDispatch();

    const usage = useGetUsage();
    const [cloudLimits] = useGetLimits();
    const openPricingModal = useOpenPricingModal();

    const user = useSelector(getCurrentUser);
    const isAdmin = useSelector(isCurrentUserSystemAdmin);
    const isCloud = useSelector(isCurrentLicenseCloud);
    const product = useSelector(selectSubscriptionProduct);
    const isStarter = product?.sku === CloudProducts.STARTER;

    const snoozePreferenceVal = useSelector((state: GlobalState) => selectPreference(state, Preferences.CLOUD_USER_EPHEMERAL_INFO, 'file_limit_banner_snooze'));

    let shouldShowAgain = true;
    if (snoozePreferenceVal !== '') {
        const snoozeInfo = JSON.parse(snoozePreferenceVal) as FileLimitSnoozePreference;
        const timeDiff = Date.now() - snoozeInfo.lastSnoozeTimestamp;
        shouldShowAgain = timeDiff >= snoozeCoolOffDaysMillis;
    }

    if (!show) {
        return null;
    }

    if (!shouldShowAgain) {
        return null;
    }

    if (!isCloud || !isStarter) {
        return null;
    }

    const fileStorageLimit = cloudLimits?.files?.total_storage;
    const currentFileStorageUsage = usage.files.totalStorage;
    if ((fileStorageLimit === undefined) || !(currentFileStorageUsage > fileStorageLimit)) {
        return null;
    }

    const snoozeBanner = () => {
        const fileLimitBannerSnoozeInfo: FileLimitSnoozePreference = {
            lastSnoozeTimestamp: Date.now(),
        };

        dispatch(savePreferences(user.id, [
            {
                category: Preferences.CLOUD_USER_EPHEMERAL_INFO,
                name: 'file_limit_banner_snooze',
                user_id: user.id,
                value: JSON.stringify(fileLimitBannerSnoozeInfo),
            },
        ]));

        setShow(false);
    };

    const adminMessage = (
        <span>
            {
                formatMessage({
                    id: 'create_post.file_limit_sticky_banner.admin_message',
                    defaultMessage: 'Your free plan is limited to {storageGB} of files. New uploads will automatically archive older files. To view them again, you can delete older files or <a>upgrade to a paid plan.</a>'},
                {
                    storageGB: asGBString(fileStorageLimit, formatNumber),
                    a: (chunks: React.ReactNode) => {
                        return (
                            <a
                                onClick={
                                    (e) => {
                                        e.preventDefault();
                                        openPricingModal({trackingLocation: 'file_limit_sticky_banner'});
                                    }
                                }
                            >{chunks}</a>);
                    },
                })
            }
        </span>
    );

    const nonAdminMessage = (
        <span>
            {formatMessage({
                id: 'create_post.file_limit_sticky_banner.non_admin_message',
                defaultMessage: 'Your free plan is limited to {storageGB} of files. New uploads will automatically archive older files. To view them again, <a>notify your admin to upgrade to a paid plan.</a>'},
            {
                storageGB: asGBString(fileStorageLimit, formatNumber),
                a: (chunks: React.ReactNode) => (
                    <NotifyAdminCTA
                        ctaText={chunks}
                        notifyRequestData={{
                            required_plan: LicenseSkus.Professional,
                            required_feature: PaidFeatures.UNLIMITED_FILE_STORAGE,
                            trial_notification: false,
                        }}
                        callerInfo='file_limit_sticky_banner'
                    />),
            },
            )}
        </span>
    );

    const tooltip = (
        <Tooltip id='file_limit_banner_snooze'>
            {formatMessage({id: 'create_post.file_limit_sticky_banner.snooze_tooltip', defaultMessage: 'Snooze for {snoozeDays} days'}, {snoozeDays: snoozeCoolOffDays})}
        </Tooltip>
    );

    return (
        <StyledDiv id='cloud_file_limit_banner'>
            <InnerDiv>
                <StyledI className='icon-alert-outline'/>
                {isAdmin ? adminMessage : nonAdminMessage}

                <OverlayTrigger
                    trigger={['hover', 'focus']}
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='left'
                    overlay={tooltip}
                >
                    <CloseIcon onClick={snoozeBanner}>
                        <i className='icon icon-close'/>
                    </CloseIcon>
                </OverlayTrigger>
            </InnerDiv>
        </StyledDiv>
    );
}

export default FileLimitStickyBanner;
