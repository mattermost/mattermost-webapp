// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl, FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {
    getCloudProducts,
    getCloudSubscription,
    getSubscriptionProduct,
} from 'mattermost-redux/selectors/entities/cloud';
import {cloudFreeEnabled} from 'mattermost-redux/selectors/entities/preferences';

import {openModal, closeModal} from 'actions/views/modals';
import {trackEvent} from 'actions/telemetry_actions';

import {ModalIdentifiers, CloudProducts} from 'utils/constants';
import {FileSizes} from 'utils/file_utils';
import {t} from 'utils/i18n';
import {asGBString, fallbackStarterLimits} from 'utils/limits';

import useGetLimits from 'components/common/hooks/useGetLimits';
import useGetUsage from 'components/common/hooks/useGetUsage';
import useOpenSalesLink from 'components/common/hooks/useOpenSalesLink';

import CloudUsageModal from 'components/cloud_usage_modal';
import MiniModal from 'components/cloud_usage_modal/mini_modal';
import PricingModal from 'components/pricing_modal';

import LimitCard from './limit_card';
import SingleInlineLimit from './single_inline_limit';

import './limits.scss';

// TODO: To be removed once components can be used from where they can belong,
// an effort for a separate ticket.
// This allows for quicker prototyping, development, and review
function TempLaunchModalsComponent() {
    const dispatch = useDispatch();
    const intl = useIntl();
    const subscription = useSelector(getCloudSubscription);
    const products = useSelector(getCloudProducts);
    const [limits] = useGetLimits();
    const usage = useGetUsage();

    return (
        <div style={{marginTop: '30px'}}>
            <button
                onClick={() => {
                    dispatch(openModal({
                        modalId: ModalIdentifiers.CLOUD_LIMITS,
                        dialogType: CloudUsageModal,
                        dialogProps: {
                            title: {
                                id: t('workspace_limits.modals.informational.title'),
                                defaultMessage: '{planName} limits',
                                values: {
                                    planName: products?.[subscription?.product_id || '']?.name || 'Unknown product',
                                },
                            },
                            description: {
                                id: t('workspace_limits.modals.informational.description.free'),
                                defaultMessage: 'These are the limits on your free plan. You can delete items to free up space or contact your admin to upgrade to a paid plan.',
                            },
                            primaryAction: {
                                message: {
                                    id: t('workspace_limits.modals.view_plans'),
                                    defaultMessage: 'View plans',
                                },
                                onClick: () => {},
                            },
                            secondaryAction: {
                                message: {
                                    id: t('workspace_limits.modals.close'),
                                    defaultMessage: 'Close',
                                },
                                onClick: () => {
                                    dispatch(closeModal(ModalIdentifiers.CLOUD_LIMITS));
                                },
                            },
                            onClose: () => {
                                dispatch(closeModal(ModalIdentifiers.CLOUD_LIMITS));
                            },
                            needsTheme: true,
                        },
                    }));
                }}
            >
                {'open informational cloud limits modal'}
            </button>
            <button
                onClick={() => {
                    dispatch(openModal({
                        modalId: ModalIdentifiers.CLOUD_LIMITS,
                        dialogType: CloudUsageModal,
                        dialogProps: {
                            title: {
                                id: t('workspace_limits.modals.limits_reached.title'),
                                defaultMessage: '{limitName} limit reached',
                                values: {
                                    limitName: intl.formatMessage({
                                        id: 'workspace_limits.boards_cards.short',
                                        defaultMessage: 'Board Cards',
                                    }),
                                },
                            },
                            description: {
                                id: t('workspace_limits.modals.informational.description.free'),
                                defaultMessage: 'These are the limits on your free plan. You can delete items to free up space or contact your admin to upgrade to a paid plan.',
                            },
                            primaryAction: {
                                message: {
                                    id: t('workspace_limits.modals.view_plans'),
                                    defaultMessage: 'View plans',
                                },
                                onClick: () => {},
                            },
                            secondaryAction: {
                                message: {
                                    id: t('workspace_limits.modals.close'),
                                    defaultMessage: 'Close',
                                },
                                onClick: () => {
                                    dispatch(closeModal(ModalIdentifiers.CLOUD_LIMITS));
                                },
                            },
                            onClose: () => {
                                dispatch(closeModal(ModalIdentifiers.CLOUD_LIMITS));
                            },
                            needsTheme: true,
                        },
                    }));
                }}
            >
                {'open cloud limits reached modal'}
            </button>
            <button
                onClick={() => {
                    dispatch(openModal({
                        modalId: ModalIdentifiers.CLOUD_LIMITS,
                        dialogType: MiniModal,
                        dialogProps: {
                            limits,
                            usage,
                            showIcons: false,
                            title: {
                                id: 'workspace_limits.modals.informational.title',
                                defaultMessage: '{planName} limits',
                                values: {
                                    planName: products?.[subscription?.product_id || '']?.name || 'Unknown product',
                                },
                            },
                            onClose: () => {
                                dispatch(closeModal(ModalIdentifiers.CLOUD_LIMITS));
                            },
                        },
                    }));
                }}
            >
                {'open cloud limits mini modal'}
            </button>
        </div>
    );
}

interface Props {
    showAnnualCard: boolean;
}

const Limits = (props: Props): JSX.Element | null => {
    const isCloudFreeEnabled = useSelector(cloudFreeEnabled);
    const intl = useIntl();
    const subscription = useSelector(getCloudSubscription);
    const dispatch = useDispatch();
    const products = useSelector(getCloudProducts);
    const subscriptionProduct = useSelector(getSubscriptionProduct);
    const [cloudLimits, limitsLoaded] = useGetLimits();
    const usage = useGetUsage();
    const openSalesLink = useOpenSalesLink();

    if (!isCloudFreeEnabled || !limitsLoaded || !subscriptionProduct || subscriptionProduct.sku === CloudProducts.STARTER_LEGACY) {
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

    let panelClassname = 'ProductLimitsPanel'
    if (singleLimitPanel) {
        if (props.showAnnualCard) {
            panelClassname += ' ProductLimitsPanel--left-panel'
        } else {
            panelClassname += ' ProductLimitsPanel--single-panel'
        }
    }
    let actionsClassname = 'ProductLimitsPanel__actions'
    if (singleLimitPanel) {
        actionsClassname += ' ProductLimitsPanel__actions--single'
    }
    return (
        <div className={panelClassname}>
            {title && <div className='ProductLimitsPanel__title'>
                {title}
            </div>}
            {description && <div className='ProductLimitsPanel__description'>
                {description}
            </div>}
            {currentUsage}
            <div className={actionsClassname}>
                {subscriptionProduct.sku === CloudProducts.STARTER && (
                    <>
                        <button
                            onClick={() => {
                                trackEvent('cloud_admin', 'click_open_pricing_modal');
                                dispatch(openModal({
                                    modalId: ModalIdentifiers.PRICING_MODAL,
                                    dialogType: PricingModal,
                                }));
                            }}
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
                    <a onClick={openSalesLink} className="ProductLimitsPanel__contact-link">
                        <FormattedMessage
                            id="workspace_limits.contact_to_upgrade"
                            defaultMessage="Contact us to upgrade"
                        />
                    </a>
                )}
            </div>
            {!singleLimitPanel && <TempLaunchModalsComponent/>}
        </div>
    );
};

export default Limits;
