// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl, FormattedMessage} from 'react-intl';
import {PrimitiveType, FormatXMLElementFn} from 'intl-messageformat';
import {useSelector} from 'react-redux';

import UpgradeLink from 'components/widgets/links/upgrade_link';
import {CloudUsage, Limits} from '@mattermost/types/cloud';

import {GlobalState} from 'mattermost-redux/types/store';
import {isCloudLicense} from 'mattermost-redux/selectors/entities/general';

import {getRemainingDaysFromFutureTimestamp} from 'utils/utils';
import {limitThresholds, asGBString} from 'utils/limits';
import {TrialPeriodDays} from 'utils/constants';
import {t} from 'utils/i18n';

import './menu_item.scss';

type Props = {
    id: string;
}

interface Words {
    title: React.ReactNode;
    description: React.ReactNode;
}

interface MaybeLimitType {
    id: string;
    limit: number | undefined;
    usage: number;
}
interface LimitType {
    id: string;
    limit: number;
    usage: number;
}

function refineToDefined(...args: MaybeLimitType[]): LimitType[] {
    return args.reduce((acc: LimitType[], maybeLimitType: MaybeLimitType) => {
        if (maybeLimitType.limit) {
            acc.push(maybeLimitType as LimitType);
        }
        return acc;
    }, []);
}

function useWords(usage: CloudUsage, limits: Limits, isAdminUser: boolean): Words | false {
    const intl = useIntl();
    if (Object.keys(limits).length === 0) {
        return false;
    }
    const maybeMessageHistoryLimit = limits.messages?.history;
    const messageHistoryUsage = usage.messages.history;

    const maybeBoardsCardsLimit = limits.boards?.cards;
    const boardsCardsUsage = usage.messages.history;

    const maybeFileStorageLimit = limits.files?.total_storage;
    const fileStorageUsage = usage.files.totalStorage;

    const maybeEnabledIntegrationsLimit = limits.integrations?.enabled;
    const enabledIntegrationsUsage = usage.integrations.enabled;

    // Order matters for this array. The designs specify:
    // > Show the plan limit that is the highest.
    // > Otherwise if there is a tie,
    // > default to showing Message History first,
    // > File storage second,
    // > and App limit third.
    const highestLimit = refineToDefined(
        {
            id: 'messageHistory',
            limit: maybeMessageHistoryLimit,
            usage: messageHistoryUsage,
        },
        {
            id: 'fileStorage',
            limit: maybeFileStorageLimit,
            usage: fileStorageUsage,
        },
        {
            id: 'enabledIntegrations',
            limit: maybeEnabledIntegrationsLimit,
            usage: enabledIntegrationsUsage,
        },
        {
            id: 'boardsCards',
            limit: maybeBoardsCardsLimit,
            usage: boardsCardsUsage,
        },
    ).
        reduce((acc: LimitType | false, curr: LimitType) => {
            if (!acc) {
                if (curr.limit && curr.limit > 0) {
                    return curr;
                }
                return acc;
            }
            if ((curr.usage / curr.limit) > (acc.usage / acc.limit)) {
                return curr;
            }
            return acc;
        }, false);
    if (!highestLimit || highestLimit.usage / highestLimit.limit < limitThresholds.warn) {
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
        a: (chunks: React.ReactNode | React.ReactNodeArray) => <a>{chunks}</a>,
    };
    switch (highestLimit.id) {
    case 'messageHistory': {
        let id = t('workspace_limits.menu_limit.warn.messages_history');
        let defaultMessage = 'You’re getting closer to the free message limit. Upgrade to unlock unlimited messages. <a>{callToAction}</a>';
        if (usageRatio >= limitThresholds.danger) {
            id = t('workspace_limits.menu_limit.critical.messages_history');
            defaultMessage = 'You’re close to hitting the free {limit} message history limit <a>{callToAction}</a>.';
            values.limit = intl.formatNumber(highestLimit.limit);
        }
        if (usageRatio >= limitThresholds.exceeded) {
            id = t('workspace_limits.menu_limit.over.messages_history');
            defaultMessage = 'You’re over the free message history limit. You can only view up to the last {limit} messages in your history. <a>{callToAction}</a>.';
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
        };
    }
    case 'fileStorage': {
        let id = t('workspace_limits.menu_limit.warn.files_storage');
        let defaultMessage = 'You’re getting closer to the free file storage limit. Upgrade to increase storage limit. <a>{callToAction}</a>';
        if (usageRatio >= limitThresholds.danger) {
            id = t('workspace_limits.menu_limit.critical.files_storage');
            defaultMessage = 'You’re close to hitting the free {limit} file storage limit <a>{callToAction}</a>.';
            values.limit = asGBString(highestLimit.limit, intl.formatNumber);
        }
        if (usageRatio >= limitThresholds.exceeded) {
            id = t('workspace_limits.menu_limit.over.files_storage');
            defaultMessage = 'You’re over the free {limit} file storage limit. Older files are automatically archived. <a>{callToAction}</a>.';
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
        };
    }
    case 'enabledIntegrations': {
        let id = t('workspace_limits.menu_limit.warn.integrations_enabled');
        let defaultMessage = 'You’re getting closer to the free integrations limit. Upgrade to unlock unlimited integrations. <a>{callToAction}</a>';
        if (usageRatio >= limitThresholds.danger) {
            id = t('workspace_limits.menu_limit.critical.integrations_enabled');
            defaultMessage = 'You’re close to hitting the free {limit} enabled integrations limit <a>{callToAction}</a>.';
            values.limit = asGBString(highestLimit.limit, intl.formatNumber);
        }
        if (usageRatio >= limitThresholds.exceeded) {
            id = 'workspace_limits.menu_limit.over.integrations_enabled';
            defaultMessage = 'You’re over the free enabled integrations limit. You can only have {limit} integrations enabled. <a>{callToAction}</a>.';
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
        };
    }

    // TODO: Add case for boards cards
    default:
        return false;
    }
}

const MenuCloudTrial= ({id}: Props) => {
    const subscription = useSelector((state: GlobalState) => state.entities.cloud.subscription);
    const isCloud = useSelector(isCloudLicense);
    const isFreeTrial = subscription?.is_free_trial === 'true';

    let daysLeftOnTrial = getRemainingDaysFromFutureTimestamp(subscription?.trial_end_at);
    if (daysLeftOnTrial > TrialPeriodDays.TRIAL_MAX_DAYS) {
        daysLeftOnTrial = TrialPeriodDays.TRIAL_MAX_DAYS;
    }

    const show = isCloud && isFreeTrial;
    if (!show) {
        return null;
    }
    const words = useWords('usage' as any, 'limits' as any, false);
    if (!words) {
        return false
    }

    return (
        <li
            className={'MenuCloudTrial'}
            role='menuitem'
            id={id}
        >
            <FormattedMessage
                id='admin.billing.subscription.cloudTrial.menuCloudTrial'
                defaultMessage='There are {daysLeftOnTrial} days left on your Cloud trial.'
                values={{daysLeftOnTrial}}
            />
            <UpgradeLink
                buttonText='Subscribe Now'
                styleLink={true}
            />
        </li>
    );
};
export default MenuCloudTrial;

