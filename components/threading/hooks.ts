// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useCallback} from 'react';
import {useRouteMatch, useHistory} from 'react-router-dom';
import {useSelector} from 'react-redux';

import {UserThread} from 'mattermost-redux/types/threads';
import {$ID, $Name} from 'mattermost-redux/types/utilities';
import {Team} from 'mattermost-redux/types/teams';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

export function useThreadRouting() {
    const {params} = useRouteMatch<{team: string; threadIdentifier?: $ID<UserThread>}>();
    const history = useHistory();
    const currentTeamId = useSelector(getCurrentTeamId);
    const currentUserId = useSelector(getCurrentUserId);
    return {
        params,
        history,
        currentTeamId,
        currentUserId,
        clear: useCallback(() => history.replace(`/${params.team}/threads`), [params]),
        select: useCallback((threadId?: $ID<UserThread>) => history.push(`/${params.team}/threads${threadId ? '/' + threadId : ''}`), [params]),
        goToInChannel: useCallback((threadId?: $ID<UserThread>, teamName?: $Name<Team>) => history.push(`/${teamName ?? params.team}/pl/${threadId ?? params.threadIdentifier}`), [params]),
    };
}
