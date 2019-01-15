// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {withRouter} from 'react-router-dom';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getTeamByName} from 'mattermost-redux/selectors/entities/teams';

import {getDirectTeammate} from 'utils/utils.jsx';
import {TutorialSteps, Preferences, Constants} from 'utils/constants.jsx';

import {goToLastViewedChannel} from 'actions/views/channel';

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

function mapStateToProps(state, ownProps) {
    const channel = getCurrentChannel(state);
    let channelLoading = false;
    const config = getConfig(state);
    const enableTutorial = config.EnableTutorial === 'true';
    const tutorialStep = getInt(state, Preferences.TUTORIAL_STEP, getCurrentUserId(state), TutorialSteps.FINISHED);
    const viewArchivedChannels = config.ExperimentalViewArchivedChannels === 'true';
    const team = getTeamByName(state, ownProps.match.params.team);

    if (channel) {
        if (channel.type !== Constants.DM_CHANNEL && channel.type !== Constants.GM_CHANNEL) {
            if (channel.name !== ownProps.match.params.identifier) {
                channelLoading = true;
            }

            if (channel.team_id && channel.team_id !== team.id) {
                channelLoading = true;
            }
        }
    } else {
        channelLoading = true;
    }

    if (channel && (channel.team_id && channel.team_id !== team.id)) {
        channelLoading = true;
    }

    return {
        channelId: channel ? channel.id : '',
        deactivatedChannel: channel ? getDeactivatedChannel(state, channel.id) : false,
        showTutorial: enableTutorial && tutorialStep <= TutorialSteps.INTRO_SCREENS,
        channelIsArchived: channel ? channel.delete_at !== 0 : false,
        viewArchivedChannels,
        channelLoading,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            goToLastViewedChannel,
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChannelView));
