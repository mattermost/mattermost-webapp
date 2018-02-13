// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getChannelStats} from 'mattermost-redux/actions/channels';
import {getTeamStats} from 'mattermost-redux/actions/teams';
import {getUser} from 'mattermost-redux/actions/users';

import TeamMembersDropdown from './team_members_dropdown.jsx';

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        getUser,
        getTeamStats,
        getChannelStats
    }, dispatch)
});

export default connect(null, mapDispatchToProps)(TeamMembersDropdown);
