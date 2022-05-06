// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useMemo} from 'react';
import {useSelector} from 'react-redux';

import {GlobalState} from 'types/store';
import {AnalyticsRow} from '@mattermost/types/admin';
import Constants from 'utils/constants';

export interface CloudUsage {
    files: {
        totalStorage: number;
    };
    messages: {
        history: number;
    };
    boards: {
        cards: number;
        views: number;
    };
    integrations: {
        enabled: number;
    };
}

function getStatValue(stat: number | AnalyticsRow[]): number | undefined {
    if (typeof stat === 'number') {
        return stat;
    }
    if (!stat || stat.length === 0) {
        return undefined;
    }
    return stat[0].value;
}

export default function useGetUsage(): CloudUsage {
    const totalStorage = useSelector(() => 0);
    const boardsCards = useSelector(() => 0);
    const boardsViews = useSelector(() => 0);
    const integrationsEnabled = useSelector(() => 0);
    const adminStats = useSelector((state: GlobalState) => state.entities.admin.analytics);

    const messageHistory = getStatValue(adminStats![Constants.StatTypes.TOTAL_POSTS]);
    const usage = useMemo(() => (
        {
            files: {
                totalStorage,
            },
            messages: {
                history: messageHistory || 0,
            },
            boards: {
                cards: boardsCards,
                views: boardsViews,
            },
            integrations: {
                enabled: integrationsEnabled,
            },
        }
    ), [totalStorage, messageHistory, boardsCards, boardsViews, integrationsEnabled]);
    return usage;
}
