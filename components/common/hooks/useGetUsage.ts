// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useMemo} from 'react';
import {useSelector} from 'react-redux';

import {FileSizes} from 'utils/file_utils';

import {CloudUsage} from '@mattermost/types/cloud';

// TODO: Replace this with actual usages stored in redux,
// that ideally are updated with a websocket event in near real time.
export default function useGetUsage(): CloudUsage {
    const totalStorage = useSelector(() => 3 * FileSizes.Gigabyte);
    const boardsCards = useSelector(() => 400);
    const boardsViews = useSelector(() => 2);
    const activeTeams = useSelector(() => 1);
    const integrationsEnabled = useSelector(() => 3);
    const messageHistory = useSelector(() => 6000);

    const usage = useMemo(() => (
        {
            files: {
                totalStorage,
            },
            messages: {
                history: messageHistory,
            },
            boards: {
                cards: boardsCards,
                views: boardsViews,
            },
            teams: {
                active: activeTeams,
            },
            integrations: {
                enabled: integrationsEnabled,
            },
        }
    ), [totalStorage, messageHistory, boardsCards, boardsViews, integrationsEnabled]);
    return usage;
}
