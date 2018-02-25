// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getChannelStats} from 'mattermost-redux/actions/channels';
import {getLicense} from 'mattermost-redux/selectors/entities/general';

import UserStore from 'stores/user_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import ChannelStore from 'stores/channel_store.jsx';
import {canManageMembers} from 'utils/channel_utils.jsx';

import ChannelMembersDropdown from './channel_members_dropdown.jsx';

function mapStateToProps(state, ownProps) {
    const license = getLicense(state);
    const isLicensed = license.IsLicensed === 'true';

    const canChangeMemberRoles = UserStore.isSystemAdminForCurrentUser() ||
        TeamStore.isTeamAdminForCurrentTeam() ||
        ChannelStore.isChannelAdminForCurrentChannel();
    const canRemoveMember = canManageMembers(
        ownProps.channel,
        ChannelStore.isChannelAdminForCurrentChannel(),
        TeamStore.isTeamAdminForCurrentTeam(),
        UserStore.isSystemAdminForCurrentUser()
    );

    return {
        isLicensed,
        canChangeMemberRoles,
        canRemoveMember,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getChannelStats,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelMembersDropdown);
