// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';
import {PrimitiveType, FormatXMLElementFn} from 'intl-messageformat';
import {useSelector} from 'react-redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {isCloudLicense} from 'mattermost-redux/selectors/entities/general';

import {limitThresholds, asGBString, inK} from 'utils/limits';
import {t} from 'utils/i18n';

import './menu_item.scss';
import useGetLimits from 'components/common/hooks/useGetLimits';
import useGetUsage from 'components/common/hooks/useGetUsage';
import useOpenPricingPage from 'components/common/hooks/useOpenPricingPage';
import UsagePercentBar from 'components/common/usage_percent_bar';
import useGetHighestThresholdCloudLimit, {LimitTypes, LimitSummary} from 'components/common/hooks/useGetHighestThresholdCloudLimit';

type Props = {
    id: string;
}

interface Words {
    title: React.ReactNode;
    description: React.ReactNode;
    status: React.ReactNode;
}

function useWords(highestLimit: LimitSummary | false, isAdminUser: boolean): Words | false {
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
    if (usageRatio >= limitThresholds.danger && isAdminUser) {
        callToAction = intl.formatMessage({
            id: 'workspace_limits.menu_limit.view_upgrade_options',
            defaultMessage: 'View upgrade options',
        });
    }

    const values: Record<string, PrimitiveType | FormatXMLElementFn<string, string> | ((chunks: React.ReactNode | React.ReactNodeArray) => JSX.Element)> = {
        callToAction,
        a: (chunks: React.ReactNode | React.ReactNodeArray) => (<a
            onClick={openPricingPage}
                                                                >{chunks}</a>),
    };
    switch (highestLimit.id) {
    case LimitTypes.messageHistory: {
        let id = t('workspace_limits.menu_limit.warn.messages_history');
        let defaultMessage = 'You’re getting closer to the free message limit. Upgrade to unlock unlimited messages. <a>{callToAction}</a>';
        if (usageRatio >= limitThresholds.danger) {
            id = t('workspace_limits.menu_limit.critical.messages_history');
            defaultMessage = 'You’re close to hitting the free {limit} message history limit <a>{callToAction}</a>.';
            values.limit = intl.formatNumber(highestLimit.limit);
        }
        if (usageRatio >= limitThresholds.exceeded) {
            id = t('workspace_limits.menu_limit.over.messages_history');
            defaultMessage = 'You’re over the free message history limit. You can only view up to the last {limit} messages in your history. <a>{callToAction}.</a>';
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
            status: inK(highestLimit.limit),
        };
    }
    case LimitTypes.fileStorage: {
        let id = t('workspace_limits.menu_limit.warn.files_storage');
        let defaultMessage = 'You’re getting closer to the free file storage limit. Upgrade to increase storage limit. <a>{callToAction}</a>';
        if (usageRatio >= limitThresholds.danger) {
            id = t('workspace_limits.menu_limit.critical.files_storage');
            defaultMessage = 'You’re close to hitting the free {limit} file storage limit <a>{callToAction}</a>.';
            values.limit = asGBString(highestLimit.limit, intl.formatNumber);
        }
        if (usageRatio >= limitThresholds.exceeded) {
            id = t('workspace_limits.menu_limit.over.files_storage');
            defaultMessage = 'You’re over the free {limit} file storage limit. Older files are automatically archived. <a>{callToAction}.</a>';
        }
        return {
            title: intl.formatMessage({
                id: 'workspace_limits.menu_limit.file_storage',
                defaultMessage: 'Total file storage',
            }),
            description: intl.formatMessage(
                {
                    id,
                    defaultMessage,
                },
                values,
            ),
            status: asGBString(highestLimit.limit, intl.formatNumber),
        };
    }
    case LimitTypes.enabledIntegrations: {
        let id = t('workspace_limits.menu_limit.warn.integrations_enabled');
        let defaultMessage = 'You’re getting closer to the free integrations limit. Upgrade to unlock unlimited integrations. <a>{callToAction}</a>';
        if (usageRatio >= limitThresholds.danger) {
            id = t('workspace_limits.menu_limit.critical.integrations_enabled');
            defaultMessage = 'You’re close to hitting the free {limit} enabled integrations limit <a>{callToAction}</a>.';
            values.limit = asGBString(highestLimit.limit, intl.formatNumber);
        }
        if (usageRatio >= limitThresholds.exceeded) {
            id = 'workspace_limits.menu_limit.over.integrations_enabled';
            defaultMessage = 'You’re over the free enabled integrations limit. You can only have {limit} integrations enabled. <a>{callToAction}.</a>';
        }
        return {
            title: intl.formatMessage({
                id: 'workspace_limits.integrations_enabled',
                defaultMessage: 'Enabled Integrations',
            }),
            description: intl.formatMessage(
                {
                    id,
                    defaultMessage,
                },
                values,
            ),
            status: highestLimit.limit,
        };
    }
    case LimitTypes.boardsCards: {
        let id = t('workspace_limits.menu_limit.warn.boards_cards');
        let defaultMessage = 'You’re getting closer to the free Boards cards limit. Upgrade to unlock unlimited Boards cards. <a>{callToAction}</a>';
        if (usageRatio >= limitThresholds.danger) {
            id = t('workspace_limits.menu_limit.critical.boards_cards');
            defaultMessage = 'You’re close to hitting the free {limit} Boards cards limit <a>{callToAction}</a>.';
            values.limit = asGBString(highestLimit.limit, intl.formatNumber);
        }
        if (usageRatio >= limitThresholds.exceeded) {
            id = 'workspace_limits.menu_limit.over.boards_cards';
            defaultMessage = 'You’re over the free Boards cards limit. You can only view the last {limit} Boards cards. <a>{callToAction}.</a>';
        }
        return {
            title: intl.formatMessage({
                id: 'workspace_limits.integrations_enabled',
                defaultMessage: 'Enabled Integrations',
            }),
            description: intl.formatMessage(
                {
                    id,
                    defaultMessage,
                },
                values,
            ),
            status: highestLimit.limit,
        };
    }
    default:
        return false;
    }
}

const MenuItemCloudLimit = ({id}: Props) => {
    const subscription = useSelector((state: GlobalState) => state.entities.cloud.subscription);
    const isCloud = useSelector(isCloudLicense);
    const isFreeTrial = subscription?.is_free_trial === 'true';
    const [limits] = useGetLimits();
    const usage = useGetUsage();
    const highestLimit = useGetHighestThresholdCloudLimit(usage, limits);
    const words = useWords(highestLimit, false);

    const show = isCloud && !isFreeTrial;
    if (!show || !words || !highestLimit) {
        return null;
    }

    let itemClass = 'MenuItemCloudLimit';
    if (((highestLimit.usage / highestLimit.limit) * 100) >= limitThresholds.danger) {
        itemClass += ' MenuItemCloudLimit--critical';
    }
    return (
        <li
            className={itemClass}
            role='menuitem'
            id={id}
        >
            <div className='MenuItemCloudLimit__title'>{words.title} <i className='icon icon-information-outline'/></div>
            <div className='MenuItemCloudLimit__description'>{words.description}</div>
            <div className='MenuItemCloudLimit__usage'>
                <UsagePercentBar
                    percent={Math.floor((highestLimit.usage / highestLimit.limit) * 100)}
                />
                <span className='MenuItemCloudLimit__usage-label'>{words.status}</span>
            </div>
        </li>
    );
};

export default MenuItemCloudLimit;
