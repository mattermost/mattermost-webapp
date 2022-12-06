// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useCallback} from 'react';
import {useParams, useHistory, generatePath} from 'react-router-dom';
import {useSelector, shallowEqual} from 'react-redux';

import {UserThread} from '@mattermost/types/threads';

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
    const teamName = pathDef?.teamName ?? params?.team;

    const select = useCallback((threadIdentifier?: UserThread['id']) => {
        if (!pathDef || !teamName) {
            return;
        }
        history.push(generatePath(pathDef.path, {team: teamName, threadIdentifier}));
    }, [teamName]);

    const clear = useCallback(() => {
        if (!pathDef || !teamName) {
            return;
        }
        history.replace(generatePath(pathDef.path, {team: teamName}));
    }, [teamName]);

    // TODO make collectionType-aware
    const goToInChannel = useCallback((threadId?: UserThread['id']) => {
        return history.push(`/${teamName}/pl/${threadId ?? params.threadIdentifier}`);
    }, [params.threadIdentifier, params.team]);

    return {
        params,
        history,
        teamName,
        currentTeamId,
        currentUserId,
        clear,
        select,
        goToInChannel,
    };
}
