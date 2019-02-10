// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getChannelStats} from 'mattermost-redux/actions/channels';
import {
    getMyTeamMembers,
    getMyTeamUnreads,
    getTeamStats,
    updateTeamMemberSchemeRoles,
} from 'mattermost-redux/actions/teams';
import {getUser} from 'mattermost-redux/actions/users';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';

import {removeUserFromTeamAndGetStats} from 'actions/team_actions.jsx';

import TeamMembersDropdown from './team_members_dropdown.jsx';

function mapStateToProps(state) {
    return {
        currentUser: getCurrentUser(state),
        currentChannelId: getCurrentChannelId(state),
        teamUrl: getCurrentRelativeTeamUrl(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getMyTeamMembers,
            getMyTeamUnreads,
            getUser,
            getTeamStats,
            getChannelStats,
            updateTeamMemberSchemeRoles,
            removeUserFromTeamAndGetStats,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamMembersDropdown);
