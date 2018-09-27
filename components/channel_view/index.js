// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {withRouter} from 'react-router-dom';

import {getDirectTeammate} from 'utils/utils.jsx';
import {TutorialSteps, Preferences, Constants} from 'utils/constants.jsx';

import {getLastViewedChannelName} from 'selectors/local_storage';

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
    const channel = state.entities.channels.channels[state.entities.channels.currentChannelId];

    const config = getConfig(state);
    const enableTutorial = config.EnableTutorial === 'true';
    const tutorialStep = getInt(state, Preferences.TUTORIAL_STEP, getCurrentUserId(state), TutorialSteps.FINISHED);
    const viewArchivedChannels = config.ExperimentalViewArchivedChannels === 'true';

    let lastViewedChannelName = getLastViewedChannelName(state);
    if (!lastViewedChannelName) {
        lastViewedChannelName = Constants.DEFAULT_CHANNEL;
    }

    return {
        channelId: channel ? channel.id : '',
        deactivatedChannel: channel ? getDeactivatedChannel(state, channel.id) : false,
        showTutorial: enableTutorial && tutorialStep <= TutorialSteps.INTRO_SCREENS,
        channelIsArchived: channel ? channel.delete_at !== 0 : false,
        lastViewedChannelName,
        viewArchivedChannels,
    };
}

export default withRouter(connect(mapStateToProps)(ChannelView));
