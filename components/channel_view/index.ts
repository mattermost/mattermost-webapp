// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import {getCurrentChannel, getDirectTeammate} from 'mattermost-redux/selectors/entities/channels';
import {getMyChannelRoles} from 'mattermost-redux/selectors/entities/roles';
import {getRoles} from 'mattermost-redux/selectors/entities/roles_helpers';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';

import {goToLastViewedChannel} from 'actions/views/channel';

import {GlobalState} from 'types/store';

import ChannelView from './channel_view';

type Actions = {
    goToLastViewedChannel: () => Promise<{data: boolean}>;
}

function isDeactivatedChannel(state: GlobalState, channelId: string) {
    const teammate = getDirectTeammate(state, channelId);

    return Boolean(teammate && teammate.delete_at);
}

function mapStateToProps(state: GlobalState) {
    const channel = getCurrentChannel(state);

    const config = getConfig(state);

    const viewArchivedChannels = config.ExperimentalViewArchivedChannels === 'true';
    const enableOnboardingFlow = config.EnableOnboardingFlow === 'true';

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
        deactivatedChannel: channel ? isDeactivatedChannel(state, channel.id) : false,
        focusedPostId: state.views.channel.focusedPostId,
        showNextStepsEphemeral: state.views.nextSteps.show && enableOnboardingFlow,
        channelIsArchived: channel ? channel.delete_at !== 0 : false,
        viewArchivedChannels,
        isCloud: getLicense(state).Cloud === 'true',
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc|GenericAction>, Actions>({
            goToLastViewedChannel,
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChannelView));
