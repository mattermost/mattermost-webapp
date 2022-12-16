// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ActionTypes} from 'utils/constants';
import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {GlobalState} from 'types/store';
import {getHistory} from 'utils/browser_history';

export const toggle = () => ({
    type: ActionTypes.TOGGLE_LHS,
});

export const open = () => ({
    type: ActionTypes.OPEN_LHS,
});

export const close = () => ({
    type: ActionTypes.CLOSE_LHS,
});

export function switchToSidebarStaticItem(id: string) {
    return (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState() as GlobalState;
        const teamUrl = getCurrentRelativeTeamUrl(state);
        getHistory().push(`${teamUrl}/${id}`);

        return {data: true};
    };
}
