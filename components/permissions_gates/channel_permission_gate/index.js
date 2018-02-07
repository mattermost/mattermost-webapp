// Copyright (c) 2017 Mattermost Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {haveIChannelPerm} from 'mattermost-redux/selectors/entities/roles';

import ChannelPermissionGate from './channel_permission_gate.jsx';

function mapStateToProps(state, ownProps) {
    if (!ownProps.teamId || !ownProps.channelId) {
        return {hasPerm: false};
    }

    for (const perm of ownProps.perms) {
        if (haveIChannelPerm(state, {channel: ownProps.channelId, team: ownProps.teamId, perm})) {
            return {hasPerm: true};
        }
    }

    return {hasPerm: false};
}

export default connect(mapStateToProps)(ChannelPermissionGate);
