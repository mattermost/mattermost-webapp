// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {CloudUsage, Limits} from '@mattermost/types/cloud';
import {limitThresholds} from 'utils/limits';

interface MaybeLimitSummary {
    id: typeof LimitTypes[keyof typeof LimitTypes];
    limit: number | undefined;
    usage: number;
}
export interface LimitSummary {
    id: typeof LimitTypes[keyof typeof LimitTypes];
    limit: number;
    usage: number;
}

function refineToDefined(...args: MaybeLimitSummary[]): LimitSummary[] {
    return args.reduce((acc: LimitSummary[], maybeLimitType: MaybeLimitSummary) => {
        if (maybeLimitType.limit) {
            acc.push(maybeLimitType as LimitSummary);
        }
        return acc;
    }, []);
}

export const LimitTypes = {
    messageHistory: 'messageHistory',
    fileStorage: 'fileStorage',
    enabledIntegrations: 'enabledIntegrations',
    boardsCards: 'boardsCards',
} as const;

export default function useGetHighestThresholdCloudLimit(usage: CloudUsage, limits: Limits): LimitSummary | false {
    if (Object.keys(limits).length === 0) {
        return false;
    }
    const maybeMessageHistoryLimit = limits.messages?.history;
    const messageHistoryUsage = usage.messages.history;

    const maybeBoardsCardsLimit = limits.boards?.cards;
    const boardsCardsUsage = usage.boards.cards;

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
        reduce((acc: LimitSummary | false, curr: LimitSummary) => {
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
    if (!highestLimit || (highestLimit.usage / highestLimit.limit) < (limitThresholds.warn / 100)) {
        return false;
    }
    return highestLimit;
}
