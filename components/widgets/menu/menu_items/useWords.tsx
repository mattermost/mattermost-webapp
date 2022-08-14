// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';
import {PrimitiveType, FormatXMLElementFn} from 'intl-messageformat';

import {limitThresholds, asGBString, inK} from 'utils/limits';
import {t} from 'utils/i18n';

import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import {LimitTypes, LimitSummary} from 'components/common/hooks/useGetHighestThresholdCloudLimit';
import NotifyAdminCTA from 'components/notify_admin_cta/notify_admin_cta';
import {NonAdminPaidFeatures, CloudProducts} from 'utils/constants';

interface Words {
    title: React.ReactNode;
    description: React.ReactNode;
    status: React.ReactNode;
}

export default function useWords(highestLimit: LimitSummary | false, isAdminUser: boolean): Words | false {
    const intl = useIntl();
    const openPricingModal = useOpenPricingModal();
    if (!highestLimit) {
        return false;
    }
    const usageRatio = (highestLimit.usage / highestLimit.limit) * 100;

    let callToAction = intl.formatMessage({
        id: 'workspace_limits.menu_limit.view_plans',
        defaultMessage: 'View plans',
    });

    if (isAdminUser) {
        callToAction = intl.formatMessage({
            id: 'workspace_limits.menu_limit.view_upgrade_options',
            defaultMessage: 'View upgrade options.',
        });
    }

    const values: Record<string, PrimitiveType | FormatXMLElementFn<string, string> | ((chunks: React.ReactNode | React.ReactNodeArray) => JSX.Element)> = {
        callToAction,
        a: (chunks: React.ReactNode | React.ReactNodeArray) => (
            <a
                onClick={openPricingModal}
            >
                {chunks}
            </a>),

    };

    let featureToNotifyOn = '';
    switch (highestLimit.id) {
    case LimitTypes.messageHistory:
        featureToNotifyOn = NonAdminPaidFeatures.UNLIMITED_MESSAGES;
        break;
    case LimitTypes.fileStorage:
        featureToNotifyOn = NonAdminPaidFeatures.UNLIMITED_FILE_STORAGE;
        break;
    case LimitTypes.enabledIntegrations:
        featureToNotifyOn = NonAdminPaidFeatures.UNLIMITED_INTEGRATIONS;
        break;
    case LimitTypes.boardsCards:
        featureToNotifyOn = NonAdminPaidFeatures.UNLIMITED_BOARD_CARDS;
        break;
    default:
        break;
    }

    if (!isAdminUser && (usageRatio >= limitThresholds.danger || usageRatio >= limitThresholds.exceeded)) {
        values.callToAction = intl.formatMessage({
            id: 'workspace_limits.menu_limit.notify_admin',
            defaultMessage: 'Notify admin',
        });
        values.a = (chunks: React.ReactNode | React.ReactNodeArray) => (
            <NotifyAdminCTA
                ctaText={chunks}
                notifyRequestData={{
                    required_feature: featureToNotifyOn,
                    required_plan: CloudProducts.PROFESSIONAL,
                    trial_notification: false}}
            />);
    }

    switch (highestLimit.id) {
    case LimitTypes.messageHistory: {
        let id = t('workspace_limits.menu_limit.warn.messages_history');
        let defaultMessage = 'You’re getting closer to the free {limit} message limit. <a>{callToAction}</a>';
        values.limit = intl.formatNumber(highestLimit.limit);
        if (usageRatio >= limitThresholds.danger) {
            if (isAdminUser) {
                id = t('workspace_limits.menu_limit.critical.messages_history');
                defaultMessage = 'You’re close to hitting the free {limit} message history limit <a>{callToAction}</a>';
            } else {
                id = t('workspace_limits.menu_limit.critical.messages_history_non_admin');
                defaultMessage = 'You\'re almost at the message limit. Your admin can upgrade your plan for unlimited messages. <a>{callToAction}</a>';
            }
        }
        if (usageRatio >= limitThresholds.exceeded) {
            if (isAdminUser) {
                id = t('workspace_limits.menu_limit.over.messages_history');
                defaultMessage = 'You’re over the free message history limit. You can only view up to the last {limit} messages in your history. <a>{callToAction}</a>';
                values.limit = inK(highestLimit.limit);
            } else {
                id = t('workspace_limits.menu_limit.over.messages_history_non_admin');
                defaultMessage = 'You\'re over your message limit. Your admin can upgrade your plan for unlimited messages. <a>{callToAction}</a>';
            }
        }
        return {
            title: intl.formatMessage({
                id: 'workspace_limits.menu_limit.messages',
                defaultMessage: 'Total messages',
            }),
            description: intl.formatMessage(
                {
                    id,
                    defaultMessage,
                },
                values,
            ),
            status: inK(highestLimit.usage),
        };
    }
    case LimitTypes.fileStorage: {
        let id = t('workspace_limits.menu_limit.warn.files_storage');
        let defaultMessage = 'You’re getting closer to the {limit} file storage limit. <a>{callToAction}</a>';
        values.limit = asGBString(highestLimit.limit, intl.formatNumber);
        if (usageRatio >= limitThresholds.danger) {
            id = t('workspace_limits.menu_limit.critical.files_storage');
            defaultMessage = 'You’re getting closer to the {limit} file storage limit. <a>{callToAction}</a>';
        }
        if (usageRatio >= limitThresholds.exceeded) {
            id = t('workspace_limits.menu_limit.over.files_storage');
            defaultMessage = 'You’re over the {limit} file storage limit. You can only access the most recent {limit} worth of files. <a>{callToAction}</a>';
        }

        return {
            title: intl.formatMessage({
                id: 'workspace_limits.menu_limit.file_storage',
                defaultMessage: 'File storage limit',
            }),
            description: intl.formatMessage(
                {
                    id,
                    defaultMessage,
                },
                values,
            ),
            status: asGBString(highestLimit.usage, intl.formatNumber),
        };
    }
    case LimitTypes.enabledIntegrations: {
        let id = t('workspace_limits.menu_limit.warn.integrations_enabled');
        let defaultMessage = 'You’re getting closer to the {limit} enabled integrations limit. <a>{callToAction}</a>';
        values.limit = highestLimit.limit;
        if (usageRatio >= limitThresholds.danger) {
            id = t('workspace_limits.menu_limit.critical.integrations_enabled');
            defaultMessage = 'You’re getting closer to the {limit} enabled integrations limit. <a>{callToAction}</a>';
        }
        if (usageRatio >= limitThresholds.exceeded) {
            id = t('workspace_limits.menu_limit.over.integrations_enabled');
            defaultMessage = 'You’ve reached the {limit} enabled integrations limit. You can’t enable additional integrations. Upgrade to remove this limit. <a>{callToAction}</a>';
        }

        return {
            title: intl.formatMessage({
                id: 'workspace_limits.menu_limit.integrations',
                defaultMessage: 'Integrations limit',
            }),
            description: intl.formatMessage(
                {
                    id,
                    defaultMessage,
                },
                values,
            ),
            status: highestLimit.usage,
        };
    }
    case LimitTypes.boardsCards: {
        let id = t('workspace_limits.menu_limit.warn.boards_cards');
        let defaultMessage = 'You’re getting closer to the {limit} board card limit. <a>{callToAction}</a>';
        values.limit = highestLimit.limit;
        if (usageRatio >= limitThresholds.danger) {
            id = t('workspace_limits.menu_limit.critical.boards_cards');
            defaultMessage = 'You’re getting closer to the {limit} board card limit. <a>{callToAction}</a>';
        }
        if (usageRatio >= limitThresholds.exceeded) {
            id = t('workspace_limits.menu_limit.over.boards_cards');
            defaultMessage = 'You’re over the {limit} board card limit. You can only access the most recent {limit} board cards. <a>{callToAction}</a>';
        }

        return {
            title: intl.formatMessage({
                id: 'workspace_limits.menu_limit.board_card',
                defaultMessage: 'Board card limit',
            }),
            description: intl.formatMessage(
                {
                    id,
                    defaultMessage,
                },
                values,
            ),
            status: highestLimit.usage,
        };
    }
    default:
        return false;
    }
}
