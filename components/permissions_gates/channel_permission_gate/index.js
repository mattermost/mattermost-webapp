// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import ChannelPermissionGate from './channel_permission_gate.jsx';

function mapStateToProps(state, ownProps) {
    const teamId = ownProps.teamId || getCurrentTeamId(state);
    if (!ownProps.channelId || !teamId) {
        return {hasPermission: false};
    }

    for (const permission of ownProps.permissions) {
        if (haveIChannelPermission(state, {channel: ownProps.channelId, team: teamId, permission})) {
            return {hasPermission: true};
        }
    }

    return {hasPermission: false};
}

export default connect(mapStateToProps)(ChannelPermissionGate);
