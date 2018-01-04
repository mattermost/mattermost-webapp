// Copyright (c) 2017 Mattermost Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {createSelector} from 'reselect';

import {get} from 'mattermost-redux/selectors/entities/preferences';

import {getDirectTeammate} from 'utils/utils.jsx';
import {TutorialSteps, Preferences} from 'utils/constants.jsx';

import ChannelView from './channel_view.jsx';

// Temporary selector until getDirectTeammate is converted to be redux-friendly
const getDeactivatedChannel = createSelector(
    (state) => state.entities.users.profiles,
    (state, channelId) => channelId,
    (users, channelId) => {
        const teammate = getDirectTeammate(channelId);
        return Boolean(teammate && teammate.delete_at);
    }
);

function mapStateToProps(state) {
    const channelId = state.entities.channels.currentChannelId;

    return {
        channelId,
        deactivatedChannel: getDeactivatedChannel(state, channelId),
        showTutorial: Number(get(state, Preferences.TUTORIAL_STEP, state.entities.users.currentUserId, 999)) <= TutorialSteps.INTRO_SCREENS && global.window.mm_config.EnableTutorial === 'true'
    };
}

export default connect(mapStateToProps)(ChannelView);
