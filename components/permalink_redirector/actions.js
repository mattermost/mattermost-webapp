// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getTeam} from 'mattermost-redux/selectors/entities/teams';

import {ErrorPageTypes} from 'utils/constants.jsx';
import {browserHistory} from 'utils/browser_history';

import LocalStorageStore from 'stores/local_storage_store';

export const redirect = (url) => {
    return (dispatch, getState) => {
        const sanitizedUrl = url.replace('/_redirect/', '');

        const state = getState();
        const teamId = LocalStorageStore.getPreviousTeamId(getCurrentUserId(state));
        const team = getTeam(state, teamId);

        if (!team) {
            browserHistory.replace(`/error?type=${ErrorPageTypes.TEAM_NOT_FOUND}`);
            return;
        }

        browserHistory.push(`/${team.name}/${sanitizedUrl}`);
    };
};
