// Copyright (c) 2017 Mattermost Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {get as getPreference} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {withRouter} from 'react-router-dom';

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

    const config = state.entities.general.config;
    const enableTutorial = config.EnableTutorial === 'true';
    const tutorialStep = parseInt(getPreference(state, Preferences.TUTORIAL_STEP, getCurrentUserId(state), TutorialSteps.FINISHED), 10);

    return {
        channelId,
        deactivatedChannel: getDeactivatedChannel(state, channelId),
        showTutorial: enableTutorial && tutorialStep <= TutorialSteps.INTRO_SCREENS
    };
}

export default withRouter(connect(mapStateToProps)(ChannelView));
