// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {fetchMyChannelsAndMembers} from 'mattermost-redux/actions/channels';

import {loadProfilesForSidebar} from 'actions/user_actions.jsx';
import {loadStatusesForChannelAndSidebar} from 'actions/status_actions.jsx';
import store from 'stores/redux_store.jsx';
import {ActionTypes} from 'utils/constants.jsx';

const getState = store.getState;

export const toggle = () => (dispatch) => dispatch({
    type: ActionTypes.TOGGLE_LHS,
});

export const open = () => (dispatch) => dispatch({
    type: ActionTypes.OPEN_LHS,
});

export const close = () => (dispatch) => dispatch({
    type: ActionTypes.CLOSE_LHS,
});

export async function initTeamChangeActions(teamId) {
    await fetchMyChannelsAndMembers(teamId)(store.dispatch, getState);
    loadStatusesForChannelAndSidebar();
    loadProfilesForSidebar();
}
