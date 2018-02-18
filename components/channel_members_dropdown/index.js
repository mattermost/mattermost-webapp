// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getChannelStats} from 'mattermost-redux/actions/channels';
import {haveIChannelPerm} from 'mattermost-redux/selectors/entities/roles';
import {getLicense} from 'mattermost-redux/selectors/entities/general';

import {canManageMembers} from 'utils/channel_utils.jsx';

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
    const license = getLicense(state);
    const isLicensed = license.IsLicensed === 'true';

    const canRemoveMember = canManageMembers(ownProps.channel);

    return {
        isLicensed,
        canChangeMemberRoles,
        canRemoveMember
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
