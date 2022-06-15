// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl, FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import {
    getCloudProducts,
    getCloudSubscription,
    getSubscriptionProduct,
} from 'mattermost-redux/selectors/entities/cloud';
import {cloudFreeEnabled} from 'mattermost-redux/selectors/entities/preferences';

import {SalesInquiryIssue} from 'selectors/cloud';

import {CloudProducts} from 'utils/constants';
import {FileSizes} from 'utils/file_utils';
import {asGBString, fallbackStarterLimits, hasSomeLimits} from 'utils/limits';

import useGetLimits from 'components/common/hooks/useGetLimits';
import useGetUsage from 'components/common/hooks/useGetUsage';
import useOpenSalesLink from 'components/common/hooks/useOpenSalesLink';
import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';

import LimitCard from './limit_card';
import SingleInlineLimit from './single_inline_limit';

import './limits.scss';

interface Props {
    showAnnualCard?: boolean;
}

const Limits = (props: Props): JSX.Element | null => {
    const isCloudFreeEnabled = useSelector(cloudFreeEnabled);
    const intl = useIntl();
    const subscription = useSelector(getCloudSubscription);
    const products = useSelector(getCloudProducts);
    const subscriptionProduct = useSelector(getSubscriptionProduct);
    const [cloudLimits, limitsLoaded] = useGetLimits();
    const usage = useGetUsage();
    const isCloudFreeTrial = subscription?.is_free_trial === 'true';
    const openSalesLink = useOpenSalesLink(SalesInquiryIssue.UpgradeEnterprise);
    const openPricingModal = useOpenPricingModal();

    if (!isCloudFreeEnabled || !subscriptionProduct || !limitsLoaded || !hasSomeLimits(cloudLimits) || isCloudFreeTrial) {
        return null;
    }

    const singleLimitPanel = subscriptionProduct.sku === CloudProducts.PROFESSIONAL;

    let title: React.ReactNode = null;
    let description: React.ReactNode = null;
    let currentUsage: React.ReactNode = null;
    if (subscriptionProduct.sku === CloudProducts.STARTER) {
        title = (
            <FormattedMessage
                id='workspace_limits.upgrade'
                defaultMessage='Upgrade to avoid {planName} data limits'
                values={{
                    planName: products?.[subscription?.product_id || '']?.name || 'Unknown product',
                }}
            />
        );
        description = intl.formatMessage(
            {
                id: 'workspace_limits.upgrade_reasons.starter',
                defaultMessage: '{planName} is restricted to {messagesLimit} message history, {storageLimit} file storage, {appsLimit} apps, and {boardsCardsLimit} board cards.  You can delete items to free up space or upgrade to a paid plan.',
            },
            {
                planName: subscriptionProduct.name,
                messagesLimit: intl.formatNumber(cloudLimits?.messages?.history || fallbackStarterLimits.messages.history),
                storageLimit: asGBString(cloudLimits?.files?.total_storage || fallbackStarterLimits.files.totalStorage, intl.formatNumber),
                appsLimit: cloudLimits?.integrations?.enabled || fallbackStarterLimits.integrations.enabled,
                boardsCardsLimit: cloudLimits?.boards?.cards || fallbackStarterLimits.boards.cards,
            },
        );
        currentUsage = (
            <div className='ProductLimitsPanel__limits'>
                {cloudLimits?.files?.total_storage && (
                    <LimitCard
                        name={(
                            <FormattedMessage
                                id='workspace_limits.file_storage'
                                defaultMessage='File Storage'
                            />
                        )}
                        status={(
                            <FormattedMessage
                                id='workspace_limits.file_storage.usage'
                                defaultMessage='{actual} of {limit} ({percent}%)'
                                values={{
                                    actual: asGBString(usage.files.totalStorage, intl.formatNumber),
                                    limit: asGBString(cloudLimits.files.total_storage, intl.formatNumber),
                                    percent: Math.floor((usage.files.totalStorage / cloudLimits.files.total_storage) * 100),

                                }}
                            />
                        )}
                        percent={Math.floor((usage.files.totalStorage / cloudLimits.files.total_storage) * 100)}
                        icon='icon-folder-outline'
                    />
                )}
                {cloudLimits?.messages?.history && (
                    <LimitCard
                        name={
                            <FormattedMessage
                                id='workspace_limits.message_history'
                                defaultMessage='Message History'
                            />
                        }
                        status={
                            <FormattedMessage
                                id='workspace_limits.message_history.usage'
                                defaultMessage='{actual} of {limit} ({percent}%)'
                                values={{
                                    actual: `${Math.floor(usage.messages.history / 1000)}K`,
                                    limit: `${Math.floor(cloudLimits.messages.history / 1000)}K`,
                                    percent: Math.floor((usage.messages.history / cloudLimits.messages.history) * 100),
                                }}
                            />
                        }
                        percent={Math.floor((usage.messages.history / cloudLimits.messages.history) * 100)}
                        icon='icon-message-text-outline'
                    />
                )}
                {cloudLimits?.boards?.cards && (
                    <LimitCard
                        name={(
                            <FormattedMessage
                                id='workspace_limits.boards_cards'
                                defaultMessage='Board Cards per Server'
                            />
                        )}
                        status={(
                            <FormattedMessage
                                id='workspace_limits.boards_cards.usage'
                                defaultMessage='{actual} of {limit} cards ({percent}%)'
                                values={{
                                    actual: usage.boards.cards,
                                    limit: cloudLimits.boards.cards,
                                    percent: Math.floor((usage.boards.cards / cloudLimits.boards.cards) * 100),
                                }}
                            />
                        )}
                        percent={Math.floor((usage.boards.cards / cloudLimits.boards.cards) * 100)}
                        icon='icon-product-boards'
                    />

                )}
                {cloudLimits?.integrations?.enabled && (
                    <LimitCard
                        name={
                            <FormattedMessage
                                id='workspace_limits.integrations_enabled'
                                defaultMessage='Enabled Integrations'
                            />
                        }
                        status={(
                            <FormattedMessage
                                id='workspace_limits.integrations_enabled.usage'
                                defaultMessage='{actual} of {limit} integrations ({percent}%)'
                                values={{
                                    actual: usage.integrations.enabled,
                                    limit: cloudLimits.integrations.enabled,
                                    percent: Math.floor((usage.integrations.enabled / cloudLimits.integrations.enabled) * 100),
                                }}
                            />
                        )}
                        percent={Math.floor((usage.integrations.enabled / cloudLimits.integrations.enabled) * 100)}
                        icon='icon-apps'
                    />

                )}
            </div>
        );
    } else if (subscriptionProduct.sku === CloudProducts.PROFESSIONAL) {
        title = (
            <FormattedMessage
                id='workspace_limits.upgrade_professional'
                defaultMessage='Professional plan data limit'
            />
        );
        description = intl.formatMessage(
            {
                id: 'workspace_limits.upgrade_reasons.professional',
                defaultMessage: 'On the Professional plan you can only view the most recent {fileStorage} of files. With Enterprise, experience unlimited file storage.',
            },
            {
                fileStorage: asGBString(cloudLimits?.files?.total_storage || FileSizes.Gigabyte * 250, intl.formatNumber),
            },
        );
        currentUsage = cloudLimits?.files?.total_storage && (
            <SingleInlineLimit
                name={(
                    <FormattedMessage
                        id='workspace_limits.file_storage'
                        defaultMessage='File Storage'
                    />
                )}
                status={(
                    <FormattedMessage
                        id='workspace_limits.file_storage.single_usage'
                        defaultMessage='{actual} of {limit}'
                        values={{
                            actual: asGBString(usage.files.totalStorage, intl.formatNumber),
                            limit: asGBString(cloudLimits.files.total_storage, intl.formatNumber),

                        }}
                    />
                )}
                percent={Math.floor((usage.files.totalStorage / cloudLimits.files.total_storage) * 100)}
                icon='icon-folder-outline'
            />
        );
    }

    let panelClassname = 'ProductLimitsPanel';
    if (singleLimitPanel) {
        if (props.showAnnualCard) {
            panelClassname += ' ProductLimitsPanel--left-panel';
        } else {
            panelClassname += ' ProductLimitsPanel--single-panel';
        }
    }
    let actionsClassname = 'ProductLimitsPanel__actions';
    if (singleLimitPanel) {
        actionsClassname += ' ProductLimitsPanel__actions--single';
    }
    return (
        <div className={panelClassname}>
            {title && (
                <div
                    data-testid='limits-panel-title'
                    className='ProductLimitsPanel__title'
                >
                    {title}
                </div>
            )}
            {description && <div className='ProductLimitsPanel__description'>
                {description}
            </div>}
            {currentUsage}
            <div className={actionsClassname}>
                {subscriptionProduct.sku === CloudProducts.STARTER && (
                    <>
                        <button
                            onClick={openPricingModal}
                            className='btn btn-primary'
                        >
                            {intl.formatMessage({
                                id: 'workspace_limits.modals.view_plan_options',
                                defaultMessage: 'View plan options',
                            })}
                        </button>
                        <button
                            onClick={openSalesLink}
                            className='btn btn-secondary'
                        >
                            {intl.formatMessage({
                                id: 'admin.license.trialCard.contactSales',
                                defaultMessage: 'Contact sales',
                            })}
                        </button>
                    </>
                )}
                {subscriptionProduct.sku === CloudProducts.PROFESSIONAL && (
                    <a
                        onClick={openSalesLink}
                        className='ProductLimitsPanel__contact-link'
                    >
                        <FormattedMessage
                            id='workspace_limits.contact_to_upgrade'
                            defaultMessage='Contact us to upgrade'
                        />
                    </a>
                )}
            </div>
        </div>
    );
};

export default Limits;
