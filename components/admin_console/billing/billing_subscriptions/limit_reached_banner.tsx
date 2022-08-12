// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl, FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import {Product} from '@mattermost/types/cloud';

import {SalesInquiryIssue} from 'selectors/cloud';

import {CloudProducts} from 'utils/constants';
import {anyUsageDeltaExceededLimit} from 'utils/limits';

import {getHasDismissedSystemConsoleLimitReached} from 'mattermost-redux/selectors/entities/preferences';
import {Preferences} from 'mattermost-redux/constants';

import useOpenSalesLink from 'components/common/hooks/useOpenSalesLink';
import useGetUsageDeltas from 'components/common/hooks/useGetUsageDeltas';
import useOpenCloudPurchaseModal from 'components/common/hooks/useOpenCloudPurchaseModal';
import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import {useSaveBool} from 'components/common/hooks/useSavePreferences';
import {t} from 'utils/i18n';

import AlertBanner from 'components/alert_banner';

import './limit_reached_banner.scss';

interface Props {
    product: Product;
}

const LimitReachedBanner = (props: Props) => {
    const intl = useIntl();
    const someLimitExceeded = anyUsageDeltaExceededLimit(useGetUsageDeltas());

    const hasDismissedBanner = useSelector(getHasDismissedSystemConsoleLimitReached);

    const openSalesLink = useOpenSalesLink(props.product?.sku === CloudProducts.PROFESSIONAL ? SalesInquiryIssue.UpgradeEnterprise : undefined);
    const openPurchaseModal = useOpenCloudPurchaseModal({});
    const openPricingModal = useOpenPricingModal();
    const saveBool = useSaveBool();
    if (hasDismissedBanner || !someLimitExceeded || (props.product?.sku !== CloudProducts.STARTER && props.product?.sku !== CloudProducts.PROFESSIONAL)) {
        return null;
    }

    let title = (
        <FormattedMessage
            id='workspace_limits.banner_upgrade.starter'
            defaultMessage='Upgrade to one of our paid plans to avoid {planName} plan data limits'
            values={{
                planName: props.product.name,
            }}
        />
    );

    let description = (
        <FormattedMessage
            id='workspace_limits.banner_upgrade_reason.starter'
            defaultMessage='Your workspace has exceeded {planName} plan data limits. Upgrade to a paid plan for additional capacity.'
            values={{
                planName: props.product.name,
            }}
        />
    );

    let upgradeMessage = {
        id: 'workspace_limits.modals.view_plans',
        defaultMessage: 'View plans',
    };

    let upgradeAction = () => openPricingModal({trackingLocation: 'limit_reached_banner'});

    if (props.product.sku === CloudProducts.PROFESSIONAL) {
        title = (
            <FormattedMessage
                id='workspace_limits.banner_upgrade.professional'
                defaultMessage='Upgrade to Enterprise to avoid Professional plan file storage limit'
            />
        );
        description = (
            <FormattedMessage
                id='workspace_limits.banner_upgrade_reason.professional'
                defaultMessage='Your workspace has exceeded the file storage limit for Professional. Upgrade to Enterprise for unlimited data usage.'
            />
        );
        upgradeMessage = {
            id: t('workspace_limits.upgrade_button'),
            defaultMessage: 'Upgrade',
        };
        upgradeAction = () => openPurchaseModal({trackingLocation: 'admin_console_limit_reached_banner'});
    }

    const onDismiss = () => {
        saveBool({
            category: Preferences.CATEGORY_UPGRADE_CLOUD,
            name: Preferences.SYSTEM_CONSOLE_LIMIT_REACHED,
            value: true,
        });
    };

    return (
        <AlertBanner
            mode='danger'
            title={title}
            message={description}
            onDismiss={onDismiss}
            className='LimitReachedBanner'
        >
            <div className='LimitReachedBanner__actions'>
                <button
                    onClick={upgradeAction}
                    className='btn LimitReachedBanner__primary'
                >
                    {intl.formatMessage(upgradeMessage)}
                </button>
                <button
                    onClick={openSalesLink}
                    className='btn LimitReachedBanner__contact-sales'
                >
                    {intl.formatMessage({
                        id: 'admin.license.trialCard.contactSales',
                        defaultMessage: 'Contact sales',
                    })}
                </button>
            </div>
        </AlertBanner>
    );
};

export default LimitReachedBanner;
