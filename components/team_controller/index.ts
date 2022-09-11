// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect, ConnectedProps} from 'react-redux';
import {RouteComponentProps} from 'react-router-dom';

import {fetchAllMyTeamsChannelsAndChannelMembers, fetchMyChannelsAndMembers, viewChannel} from 'mattermost-redux/actions/channels';
import {getLicense, getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId, getMyTeams} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';

import {GlobalState} from 'types/store';

import {getSelectedThreadIdInCurrentTeam} from 'selectors/views/threads';

import {markChannelAsReadOnFocus} from 'actions/views/channel';
import {initializeTeam, joinTeam} from 'components/team_controller/actions';

import {checkIfMFARequired} from 'utils/route';

import TeamController from './team_controller';

type Params = {
    url: string;
    team?: string;
}

export type OwnProps = RouteComponentProps<Params>;

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const license = getLicense(state);
    const config = getConfig(state);
    const currentUser = getCurrentUser(state);
    const plugins = state.plugins.components.NeedsTeamComponent;

    return {
        currentUser,
        currentTeamId: getCurrentTeamId(state),
        currentChannelId: getCurrentChannelId(state),
        teamsList: getMyTeams(state),
        plugins,
        selectedThreadId: getSelectedThreadIdInCurrentTeam(state),
        mfaRequired: checkIfMFARequired(currentUser, license, config, ownProps.match.url),
    };
}

const mapDispatchToProps = {
    fetchMyChannelsAndMembers,
    fetchAllMyTeamsChannelsAndChannelMembers,
    viewChannel,
    markChannelAsReadOnFocus,
    initializeTeam,
    joinTeam,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(TeamController);
