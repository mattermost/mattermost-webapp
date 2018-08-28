// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getTeamByName} from 'mattermost-redux/selectors/entities/teams';
import {makeGetChannel} from 'mattermost-redux/selectors/entities/channels';
import {withRouter} from 'react-router-dom';

import {getDirectTeammate} from 'utils/utils.jsx';
import {TutorialSteps, Preferences, Constants} from 'utils/constants.jsx';

import {getLastViewedChannelName} from 'selectors/storage';

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

function makeMapStateToProps() {
    const getChannel = makeGetChannel();
    return (state, ownProps) => {
        let channelLoading = false;
        const channelId = state.entities.channels.currentChannelId;

        const config = getConfig(state);
        const enableTutorial = config.EnableTutorial === 'true';
        const tutorialStep = getInt(state, Preferences.TUTORIAL_STEP, getCurrentUserId(state), TutorialSteps.FINISHED);
        const team = getTeamByName(state, ownProps.match.params.team);
        const channel = getChannel(state, {id: channelId});
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

        let lastViewedChannelName = getLastViewedChannelName(state);
        if (!lastViewedChannelName) {
            lastViewedChannelName = Constants.DEFAULT_CHANNEL;
        }

        return {
            channelLoading,
            channelId,
            deactivatedChannel: getDeactivatedChannel(state, channelId),
            showTutorial: enableTutorial && tutorialStep <= TutorialSteps.INTRO_SCREENS,
            channelIsArchived: channel ? channel.delete_at !== 0 : false,
            lastViewedChannelName,
        };
    };
}

export default withRouter(connect(makeMapStateToProps)(ChannelView));
