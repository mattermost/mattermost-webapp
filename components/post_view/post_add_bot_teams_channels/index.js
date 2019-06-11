// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {addChannelMember} from 'mattermost-redux/actions/channels';
import {editPost} from 'mattermost-redux/actions/posts';
import {getMyTeams} from 'mattermost-redux/selectors/entities/teams';

import {addUserToTeam} from 'actions/team_actions';

import PostAddBotTeamsChannels from './post_add_bot_teams_channels.jsx';

function mapStateToProps(state, ownProps) {
    return {
        teams: getMyTeams(state),
        post: ownProps.post,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            addUserToTeam,
            addChannelMember,
            editPost,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostAddBotTeamsChannels);
