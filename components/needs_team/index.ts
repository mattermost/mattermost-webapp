// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect, ConnectedProps} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {RouteComponentProps} from 'react-router-dom';

import {Channel, ChannelMembership} from '@mattermost/types/channels';
import {Team, TeamMembership} from '@mattermost/types/teams';
import {Group} from '@mattermost/types/groups';
import {UserStatus} from '@mattermost/types/users';

import {fetchAllMyTeamsChannelsAndChannelMembers, fetchMyChannelsAndMembers, viewChannel} from 'mattermost-redux/actions/channels';
import {getMyTeamUnreads, getTeamByName, selectTeam} from 'mattermost-redux/actions/teams';
import {getGroups, getAllGroupsAssociatedToChannelsInTeam, getAllGroupsAssociatedToTeam, getGroupsByUserIdPaginated} from 'mattermost-redux/actions/groups';
import {isCollapsedThreadsEnabled, isCustomGroupsEnabled} from 'mattermost-redux/selectors/entities/preferences';
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

import NeedsTeam from './needs_team';

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
    };
}

type Actions = {
    fetchMyChannelsAndMembers: (teamId: string) => Promise<{ data: { channels: Channel[]; members: ChannelMembership[] } }>;
    fetchAllMyTeamsChannelsAndChannelMembers: () => Promise<{ data: { channels: Channel[]; members: ChannelMembership[]} }>;
    getMyTeamUnreads: (collapsedThreads: boolean) => Promise<{data: any; error?: any}>;
    viewChannel: (channelId: string, prevChannelId?: string | undefined) => Promise<{data: boolean}>;
    markChannelAsReadOnFocus: (channelId: string) => Promise<{data: any; error?: any}>;
    getTeamByName: (teamName: string) => Promise<{data: Team}>;
    addUserToTeam: (teamId: string, userId?: string) => Promise<{data: TeamMembership; error?: any}>;
    selectTeam: (team: Team) => Promise<{data: boolean}>;
    setPreviousTeamId: (teamId: string) => Promise<{data: boolean}>;
    loadStatusesForChannelAndSidebar: () => Promise<{data: UserStatus[]}>;
    getAllGroupsAssociatedToChannelsInTeam: (teamId: string, filterAllowReference: boolean) => Promise<{data: Group[]}>;
    getAllGroupsAssociatedToTeam: (teamId: string, filterAllowReference: boolean) => Promise<{data: Group[]}>;
    getGroupsByUserIdPaginated: (userId: string, filterAllowReference: boolean, page: number, perPage: number, includeMemberCount: boolean) => Promise<{data: Group[]}>;
    getGroups: (filterAllowReference: boolean, page: number, perPage: number) => Promise<{data: Group[]}>;
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject, Actions>({
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
            getGroupsByUserIdPaginated,
            getGroups,
        }, dispatch),
    };
}

const connector = connect(mapStateToProps, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(NeedsTeam);
