// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl, FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {cloudFreeEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {
    getCloudProducts,
    getCloudSubscription,
} from 'mattermost-redux/selectors/entities/cloud';
import {openModal, closeModal} from 'actions/views/modals';
import {FileSizes} from 'utils/file_utils';
import {asGBString} from 'utils/limits';
import {ModalIdentifiers} from 'utils/constants';
import CloudUsageModal from 'components/cloud_usage_modal';
import MiniModal from 'components/cloud_usage_modal/mini_modal';
import useGetLimits from 'components/common/hooks/useGetLimits';
import useGetUsage from 'components/common/hooks/useGetUsage';
import {t} from 'utils/i18n';

import LimitCard from './limit_card';

// TODO: Replace this with actual usages stored in redux,
// that ideally are updated with a websocket event in near real time.
const fakeUsage = {
    files: {
        totalStorage: Number(FileSizes.Gigabyte) * 2,
    },
    messages: {
        history: 11000,
    },
    boards: {
        cards: 300,
    },
    integrations: {
        enabled: 9,
    },
};

// TODO: To be removed once companents can be used from where they can belong, an effort for a separate ticket.
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
                            showIcons: true,
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
                            showIcons: true,
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

const Limits = (): JSX.Element | null => {
    const isCloudFreeEnabled = useSelector(cloudFreeEnabled);
    const intl = useIntl();
    const subscription = useSelector(getCloudSubscription);
    const products = useSelector(getCloudProducts);
    const [cloudLimits, limitsLoaded] = useGetLimits();

    if (!isCloudFreeEnabled || !limitsLoaded) {
        return null;
    }

    return (
        <div className='ProductLimitsPanel'>
            <div className='ProductLimitsPanel__title'>
                <FormattedMessage
                    id='workspace_limits.upgrade'
                    defaultMessage='Upgrade to avoid {planName} data limits'
                    values={{
                        planName: products?.[subscription?.product_id || '']?.name || 'Unknown product',
                    }}
                />
            </div>
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
                                    actual: asGBString(fakeUsage.files.totalStorage, intl.formatNumber),
                                    limit: asGBString(cloudLimits.files.total_storage, intl.formatNumber),
                                    percent: Math.floor((fakeUsage.files.totalStorage / cloudLimits.files.total_storage) * 100),

                                }}
                            />
                        )}
                        percent={Math.floor((fakeUsage.files.totalStorage / cloudLimits.files.total_storage) * 100)}
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
                                    actual: `${Math.floor(fakeUsage.messages.history / 1000)}K`,
                                    limit: `${Math.floor(cloudLimits.messages.history / 1000)}K`,
                                    percent: Math.floor((fakeUsage.messages.history / cloudLimits.messages.history) * 100),
                                }}
                            />
                        }
                        percent={Math.floor((fakeUsage.messages.history / cloudLimits.messages.history) * 100)}
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
                                    actual: fakeUsage.boards.cards,
                                    limit: cloudLimits.boards.cards,
                                    percent: Math.floor((fakeUsage.boards.cards / cloudLimits.boards.cards) * 100),
                                }}
                            />
                        )}
                        percent={Math.floor((fakeUsage.boards.cards / cloudLimits.boards.cards) * 100)}
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
                                    actual: fakeUsage.integrations.enabled,
                                    limit: cloudLimits.integrations.enabled,
                                    percent: Math.floor((fakeUsage.integrations.enabled / cloudLimits.integrations.enabled) * 100),
                                }}
                            />
                        )}
                        percent={Math.floor((fakeUsage.integrations.enabled / cloudLimits.integrations.enabled) * 100)}
                        icon='icon-apps'
                    />

                )}
            </div>
            <TempLaunchModalsComponent/>
        </div>
    );
};

export default Limits;
