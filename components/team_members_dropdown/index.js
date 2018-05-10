// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getChannelStats} from 'mattermost-redux/actions/channels';
import {getTeamStats} from 'mattermost-redux/actions/teams';
import {getUser} from 'mattermost-redux/actions/users';

import TeamMembersDropdown from './team_members_dropdown.jsx';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getUser,
            getTeamStats,
            getChannelStats,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamMembersDropdown);
