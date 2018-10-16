// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getChannelStats, updateChannelMemberSchemeRoles} from 'mattermost-redux/actions/channels';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {Permissions} from 'mattermost-redux/constants';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {canManageMembers} from 'utils/channel_utils.jsx';

import ChannelMembersDropdown from './channel_members_dropdown.jsx';

function mapStateToProps(state, ownProps) {
    const canChangeMemberRoles = haveIChannelPermission(
        state,
        {
            channel: ownProps.channel.id,
            team: ownProps.channel.team_id,
            permission: Permissions.MANAGE_CHANNEL_ROLES,
        }
    );
    const license = getLicense(state);
    const isLicensed = license.IsLicensed === 'true';

    const canRemoveMember = canManageMembers(ownProps.channel);

    return {
        currentUser: getCurrentUser(state),
        isLicensed,
        canChangeMemberRoles,
        canRemoveMember,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getChannelStats,
            updateChannelMemberSchemeRoles,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelMembersDropdown);
