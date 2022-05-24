// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useMemo} from 'react';

import {CloudUsage} from '@mattermost/types/cloud';

import useGetUsage from './useGetUsage';
import useGetLimits from './useGetLimits';

export default function useGetUsageDeltas(): CloudUsage {
    const usage = useGetUsage();
    const cloudLimits = useGetLimits();
    const limits = cloudLimits[0];

    const usageDelta = useMemo(() => (
        {
            files: {
                totalStorage: usage.files.totalStorage - (limits.files?.total_storage || 0),
            },
            messages: {
                history: usage.messages.history - (limits.messages?.history || 0),
            },
            boards: {
                cards: usage.boards.cards - (limits.boards?.cards || 0),
                views: usage.boards.views - (limits.boards?.views || 0),
            },
            integrations: {
                enabled: usage.integrations.enabled - (limits.integrations?.enabled || 0),
            },
        }
    ), [usage, limits]);
    return usageDelta;
}
