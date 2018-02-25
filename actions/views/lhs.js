
import {fetchMyChannelsAndMembers} from 'mattermost-redux/actions/channels';

import {loadProfilesForSidebar} from 'actions/user_actions.jsx';
import {loadStatusesForChannelAndSidebar} from 'actions/status_actions.jsx';
import store from 'stores/redux_store.jsx';

const dispatch = store.dispatch;
const getState = store.getState;

export async function initTeamChangeActions(teamId) {
    await fetchMyChannelsAndMembers(teamId)(dispatch, getState);
    loadStatusesForChannelAndSidebar();
    loadProfilesForSidebar();
}
