// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';

import {fetchMyChannelsAndMembers, markChannelAsRead, viewChannel} from 'mattermost-redux/actions/channels';
import {getMyTeamUnreads, getTeams, joinTeam, selectTeam} from 'mattermost-redux/actions/teams';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {getLicense, getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId, getMyTeams} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';

import {loadStatusesForChannelAndSidebar} from 'actions/status_actions';
import {setPreviousTeamId} from 'actions/local_storage';
import {checkIfMFARequired} from 'utils/route';

import NeedsTeam from './needs_team.jsx';

function mapStateToProps(state, ownProps) {
    const license = getLicense(state);
    const config = getConfig(state);
    const currentUser = getCurrentUser(state);

    return {
        theme: getTheme(state),
        mfaRequired: checkIfMFARequired(currentUser, license, config, ownProps.match.url),
        currentUser,
        currentTeamId: getCurrentTeamId(state),
        teamsList: getMyTeams(state),
        currentChannelId: getCurrentChannelId(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            fetchMyChannelsAndMembers,
            getMyTeamUnreads,
            viewChannel,
            markChannelAsRead,
            getTeams,
            joinTeam,
            setPreviousTeamId,
            selectTeam,
            loadStatusesForChannelAndSidebar,
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NeedsTeam));
