// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useCallback} from 'react';
import {useRouteMatch, useHistory} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';

import {UserThread} from 'mattermost-redux/types/threads';
import {$ID} from 'mattermost-redux/types/utilities';
import {Team} from 'mattermost-redux/types/teams';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {markThreadsRead} from 'mattermost-redux/actions/threads';

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
        select: useCallback((threadId: $ID<UserThread>) => history.push(`/${params.team}/threads/${threadId}`), [params]),
        goToInChannel: useCallback((threadId?: $ID<UserThread>, teamId?: $ID<Team>) => history.push(`/${teamId ?? params.team}/pl/${threadId ?? params.threadIdentifier}`), [params]),
    };
}

export function useThreadActionCallbacks() {
    const dispatch = useDispatch();
    const {currentTeamId, currentUserId} = useThreadRouting();
    return {
        markThreadsRead: useCallback(() => {
            dispatch(markThreadsRead(currentUserId, currentTeamId));
        }, [currentTeamId, currentUserId]),
    };
}
