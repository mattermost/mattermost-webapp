// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect, ConnectedProps} from 'react-redux';
import {RouteComponentProps} from 'react-router-dom';

import {fetchAllMyTeamsChannelsAndChannelMembers, fetchMyChannelsAndMembers, viewChannel} from 'mattermost-redux/actions/channels';
import {getTeamByName, selectTeam} from 'mattermost-redux/actions/teams';
import {getGroups, getAllGroupsAssociatedToChannelsInTeam, getAllGroupsAssociatedToTeam, getGroupsByUserIdPaginated} from 'mattermost-redux/actions/groups';
import {isCollapsedThreadsEnabled, isCustomGroupsEnabled, isGraphQLEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getLicense, getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId, getMyTeams} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';

import {GlobalState} from 'types/store';

import {getPreviousTeamId} from 'selectors/local_storage';
import {shouldShowAppBar} from 'selectors/plugins';
import {getSelectedThreadIdInCurrentTeam} from 'selectors/views/threads';

import {setPreviousTeamId} from 'actions/local_storage';
import {loadStatusesForChannelAndSidebar} from 'actions/status_actions';
import {addUserToTeam} from 'actions/team_actions';
import {markChannelAsReadOnFocus} from 'actions/views/channel';

import {checkIfMFARequired} from 'utils/route';

import TeamController from './team_controller';

type Params = {
    url: string;
    team: string;
}

export type OwnProps = RouteComponentProps<Params>;

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const license = getLicense(state);
    const config = getConfig(state);
    const currentUser = getCurrentUser(state);
    const plugins = state.plugins.components.NeedsTeamComponent;
    const isCustomUserGroupsEnabled = isCustomGroupsEnabled(state);
    const graphQLEnabled = isGraphQLEnabled(state);

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
        isCustomGroupsEnabled: isCustomUserGroupsEnabled,
        isGraphQLEnabled: graphQLEnabled,
    };
}

const mapDispatchToProps = {
    fetchMyChannelsAndMembers,
    fetchAllMyTeamsChannelsAndChannelMembers,
    viewChannel,
    markChannelAsReadOnFocus,
    getTeamByName,
    addUserToTeam,
    setPreviousTeamId,
    selectTeam,
    loadStatusesForChannelAndSidebar,
    getAllGroupsAssociatedToChannelsInTeam,
    getAllGroupsAssociatedToTeam,
    getGroupsByUserIdPaginated,
    getGroups,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(TeamController);
