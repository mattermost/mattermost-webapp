// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getMyChannelRoles} from 'mattermost-redux/selectors/entities/roles';
import {getRoles} from 'mattermost-redux/selectors/entities/roles_helpers';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {withRouter} from 'react-router-dom';

import {getProfiles} from 'mattermost-redux/actions/users';

import {getDirectTeammate} from 'utils/utils.jsx';
import {TutorialSteps, Preferences} from 'utils/constants';

import {goToLastViewedChannel} from 'actions/views/channel';
import {setShowNextStepsView} from 'actions/views/next_steps';
import {isOnboardingHidden, showNextSteps, showNextStepsTips} from 'components/next_steps_view/steps';

import ChannelView from './channel_view.jsx';

// Temporary selector until getDirectTeammate is converted to be redux-friendly
const getDeactivatedChannel = createSelector(
    (state, channelId) => {
        return getDirectTeammate(state, channelId);
    },
    (teammate) => {
        return Boolean(teammate && teammate.delete_at);
    },
);

function mapStateToProps(state) {
    const channel = getCurrentChannel(state);

    const config = getConfig(state);
    const enableTutorial = config.EnableTutorial === 'true';
    const tutorialStep = getInt(state, Preferences.TUTORIAL_STEP, getCurrentUserId(state), TutorialSteps.FINISHED);
    const viewArchivedChannels = config.ExperimentalViewArchivedChannels === 'true';

    let channelRolesLoading = true;
    if (channel && channel.id) {
        const roles = getRoles(state);
        const myChannelRoles = getMyChannelRoles(state);
        if (myChannelRoles[channel.id]) {
            const channelRoles = myChannelRoles[channel.id].values();
            for (const roleName of channelRoles) {
                if (roles[roleName]) {
                    channelRolesLoading = false;
                }
                break;
            }
        }
    }

    return {
        channelId: channel ? channel.id : '',
        channelRolesLoading,
        deactivatedChannel: channel ? getDeactivatedChannel(state, channel.id) : false,
        showTutorial: enableTutorial && tutorialStep <= TutorialSteps.INTRO_SCREENS,
        showNextSteps: showNextSteps(state),
        showNextStepsTips: showNextStepsTips(state),
        isOnboardingHidden: isOnboardingHidden(state),
        showNextStepsEphemeral: state.views.nextSteps.show,
        channelIsArchived: channel ? channel.delete_at !== 0 : false,
        viewArchivedChannels,
        isCloud: getLicense(state).Cloud === 'true',
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            setShowNextStepsView,
            goToLastViewedChannel,
            getProfiles,
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChannelView));
