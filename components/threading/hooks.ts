// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useCallback} from 'react';
import {useParams, useHistory, generatePath, useRouteMatch} from 'react-router-dom';
import {useSelector, shallowEqual} from 'react-redux';

import {UserThread} from '@mattermost/types/threads';
import {Team} from '@mattermost/types/teams';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {usePathDef} from './global_threads/routing';

/**
 * GlobalThreads-specific hook for nav/routing, selection, and common data needed for actions.
 */
export function useThreadRouting() {
    const params = useParams<{team: string; threadIdentifier?: UserThread['id']}>();
    const history = useHistory();

    const currentTeamId = useSelector(getCurrentTeamId, shallowEqual);
    const currentUserId = useSelector(getCurrentUserId, shallowEqual);

    const {pathDef} = usePathDef();
    const matches = useRouteMatch(pathDef?.path ?? '');

    const team = pathDef?.teamName ?? params?.team;

    const select = useCallback((threadIdentifier?: UserThread['id']) => {
        if (!pathDef || !matches || !team) {
            return;
        }
        history.push(generatePath(pathDef.path, {team, threadIdentifier}));
    }, [team]);

    const clear = useCallback(() => {
        if (!pathDef || !matches || !team) {
            return;
        }
        history.replace(generatePath(pathDef.path, {team}));
    }, [team]);

    const goToInChannel = useCallback((threadId?: UserThread['id'], teamName: Team['name'] = team) => {
        // TODO make collectionType-aware
        return history.push(`/${teamName}/pl/${threadId ?? params.threadIdentifier}`);
    }, [params.threadIdentifier, params.team]);

    return {
        params,
        history,
        currentTeamId,
        currentUserId,
        clear,
        select,
        goToInChannel,
    };
}
