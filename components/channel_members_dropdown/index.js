// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getChannelStats} from 'mattermost-redux/actions/channels';
import {haveIChannelPerm} from 'mattermost-redux/selectors/entities/roles';

import ChannelMembersDropdown from './channel_members_dropdown.jsx';

function mapStateToProps(state, ownProps) {
    const canChangeMemberRoles = haveIChannelPerm(
        state,
        {
            channel: ownProps.channel.id,
            team: ownProps.channel.team_id,
            perm: Permissions.MANAGE_CHANNEL_ROLES
        }
    );
    return {
        canChangeMemberRoles
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getChannelStats
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelMembersDropdown);
