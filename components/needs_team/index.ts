// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {withRouter} from 'react-router-dom';

import {fetchAllMyTeamsChannelsAndChannelMembers, fetchMyChannelsAndMembers, viewChannel} from 'mattermost-redux/actions/channels';
import {getMyTeamUnreads, getTeamByName, selectTeam} from 'mattermost-redux/actions/teams';
import {getGroups, getAllGroupsAssociatedToChannelsInTeam, getAllGroupsAssociatedToTeam, getGroupsByUserId} from 'mattermost-redux/actions/groups';
import {getFirstAdminCompleteSetup as getFirstAdminCompleteSetupAction} from 'mattermost-redux/actions/general';
import {isCollapsedThreadsEnabled, getUseCaseOnboarding} from 'mattermost-redux/selectors/entities/preferences';
import {getLicense, getConfig, getFirstAdminCompleteSetup} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId, getMyTeams} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {Action} from 'mattermost-redux/types/actions';

import {isFirstAdmin} from 'components/next_steps_view/steps';

import {GlobalState} from 'types/store';

import {setPreviousTeamId} from 'actions/local_storage';
import {getPreviousTeamId} from 'selectors/local_storage';
import {shouldShowAppBar} from 'selectors/plugins';
import {loadStatusesForChannelAndSidebar} from 'actions/status_actions';
import {addUserToTeam} from 'actions/team_actions';
import {markChannelAsReadOnFocus} from 'actions/views/channel';
import {getSelectedThreadIdInCurrentTeam} from 'selectors/views/threads';
import {checkIfMFARequired} from 'utils/route';

import NeedsTeam from './needs_team';

type OwnProps = {
    match: {
        url: string;
    };
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const license = getLicense(state);
    const config = getConfig(state);
    const currentUser = getCurrentUser(state);
    const plugins = state.plugins.components.NeedsTeamComponent;
    const isUserFirstAdmin = isFirstAdmin(state);
    const useCaseOnboarding = getUseCaseOnboarding(state);

    let adminSetupRequired = false;
    if (useCaseOnboarding && isUserFirstAdmin) {
        const firstAdminCompletedSetup = getFirstAdminCompleteSetup(state);
        if (!firstAdminCompletedSetup) {
            adminSetupRequired = true;
        }
    }

    return {
        license,
        collapsedThreads: isCollapsedThreadsEnabled(state),
        mfaRequired: checkIfMFARequired(currentUser, license, config, ownProps.match.url),
        currentUser,
        currentTeamId: getCurrentTeamId(state),
        previousTeamId: getPreviousTeamId(state) as string,
        teamsList: getMyTeams(state),
        currentChannelId: getCurrentChannelId(state),
        plugins,
        selectedThreadId: getSelectedThreadIdInCurrentTeam(state),
        shouldShowAppBar: shouldShowAppBar(state),
        adminSetupRequired,
        isUserFirstAdmin,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<Action>, any>({
            fetchMyChannelsAndMembers,
            fetchAllMyTeamsChannelsAndChannelMembers,
            getMyTeamUnreads,
            viewChannel,
            markChannelAsReadOnFocus,
            getTeamByName,
            addUserToTeam,
            setPreviousTeamId,
            selectTeam,
            loadStatusesForChannelAndSidebar,
            getAllGroupsAssociatedToChannelsInTeam,
            getAllGroupsAssociatedToTeam,
            getGroupsByUserId,
            getGroups,
            getFirstAdminCompleteSetup: getFirstAdminCompleteSetupAction,
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NeedsTeam));
