// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';
import {PrimitiveType, FormatXMLElementFn} from 'intl-messageformat';

import {limitThresholds, asGBString, inK} from 'utils/limits';
import {t} from 'utils/i18n';

import useOpenPricingPage from 'components/common/hooks/useOpenPricingPage';
import {LimitTypes, LimitSummary} from 'components/common/hooks/useGetHighestThresholdCloudLimit';

interface Words {
    title: React.ReactNode;
    description: React.ReactNode;
    status: React.ReactNode;
}

export default function useWords(highestLimit: LimitSummary | false, isAdminUser: boolean): Words | false {
    const intl = useIntl();
    const openPricingPage = useOpenPricingPage();
    if (!highestLimit) {
        return false;
    }
    const usageRatio = highestLimit.usage / highestLimit.limit;
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
                onClick={openPricingPage}
            >
                {chunks}
            </a>
        ),
    };
    switch (highestLimit.id) {
    case LimitTypes.messageHistory: {
        let id = t('workspace_limits.menu_limit.warn.messages_history');

        let defaultMessage = 'You’re getting closer to the free {limit} message limit. Upgrade to unlock unlimited messages. <a>{callToAction}</a>';
        values.limit = intl.formatNumber(highestLimit.limit);
        if (usageRatio >= limitThresholds.danger) {
            id = t('workspace_limits.menu_limit.critical.messages_history');
            defaultMessage = 'You’re close to hitting the free {limit} message history limit <a>{callToAction}</a>';
        }
        if (usageRatio >= limitThresholds.exceeded) {
            id = t('workspace_limits.menu_limit.over.messages_history');
            defaultMessage = 'You’re over the free message history limit. You can only view up to the last {limit} messages in your history. <a>{callToAction}</a>';
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
        let defaultMessage = 'You’re getting closer to the free file storage limit. Upgrade to increase storage limit. <a>{callToAction}</a>';
        if (usageRatio >= limitThresholds.danger) {
            id = t('workspace_limits.menu_limit.critical.files_storage');
            defaultMessage = 'You’re close to hitting the free {limit} file storage limit <a>{callToAction}</a>';
            values.limit = asGBString(highestLimit.limit, intl.formatNumber);
        }
        if (usageRatio >= limitThresholds.exceeded) {
            id = t('workspace_limits.menu_limit.over.files_storage');
            defaultMessage = 'You’re over the free {limit} file storage limit. Older files are automatically archived. <a>{callToAction}</a>';
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
        let defaultMessage = 'You’re getting closer to the free integrations limit. Upgrade to unlock unlimited integrations. <a>{callToAction}</a>';
        values.limit = highestLimit.limit;
        if (usageRatio >= limitThresholds.danger) {
            id = t('workspace_limits.menu_limit.critical.integrations_enabled');
            defaultMessage = 'You’re close to hitting the free {limit} enabled integrations limit <a>{callToAction}</a>';
        }
        if (usageRatio >= limitThresholds.exceeded) {
            id = t('workspace_limits.menu_limit.over.integrations_enabled');
            defaultMessage = 'You’re over the free enabled integrations limit. You can only have {limit} integrations enabled. <a>{callToAction}</a>';
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
        let defaultMessage = 'You’re getting closer to the free Boards cards limit. Upgrade to unlock unlimited Boards cards. <a>{callToAction}</a>';
        if (usageRatio >= limitThresholds.danger) {
            id = t('workspace_limits.menu_limit.critical.boards_cards');
            defaultMessage = 'You’re close to hitting the free {limit} Boards cards limit <a>{callToAction}</a>';
            values.limit = asGBString(highestLimit.limit, intl.formatNumber);
        }
        if (usageRatio >= limitThresholds.exceeded) {
            id = 'workspace_limits.menu_limit.over.boards_cards';
            defaultMessage = 'You’re over the free Boards cards limit. You can only view the last {limit} Boards cards. <a>{callToAction}</a>';
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


