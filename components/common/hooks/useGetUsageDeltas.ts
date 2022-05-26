// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useMemo} from 'react';

import {CloudUsage} from '@mattermost/types/cloud';

import useGetUsage from './useGetUsage';
import useGetLimits from './useGetLimits';

// Returns an object of type CloudUsage with the values being the delta between the limit, and the actual usage of this installation.
// A value < 0 means that they are NOT over the limit. A value > 0 means they've exceeded that limit
// 2 teams used, minus 1 team limit = value > 0, limit exceeded
// 10MB files used, minus 1000MB limit = value < 0, limit not exceeded.
// etc.
export default function useGetUsageDeltas(): CloudUsage {
    const usage = useGetUsage();
    const cloudLimits = useGetLimits();
    const limits = cloudLimits[0];

    const usageDelta = useMemo(() => (
        {
            files: {
                totalStorage: usage.files.totalStorage - (limits.files?.total_storage || 0),
                totalStorageLoaded: usage.files.totalStorageLoaded,
            },
            messages: {
                history: usage.messages.history - (limits.messages?.history || 0),
                historyLoaded: usage.messages.historyLoaded,
            },
            boards: {
                cards: usage.boards.cards - (limits.boards?.cards || 0),
                cardsLoaded: usage.boards.cardsLoaded,
            },
            teams: {
                active: usage.teams.active - (limits.teams?.active || 0),

                // cloudArchived doesn't count against usage, but we pass the value along for convenience
                cloudArchived: usage.teams.cloudArchived,
                teamsLoaded: usage.teams.teamsLoaded,
            },
            integrations: {
                enabled: usage.integrations.enabled - (limits.integrations?.enabled || 0),
                enabledLoaded: usage.integrations.enabledLoaded,
            },
        }
    ), [usage, limits]);

    return usageDelta;
}
