// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getAllGroups, getGroupsAssociatedToChannel} from 'mattermost-redux/selectors/entities/groups';
import {getChannel as fetchChannel, membersMinusGroupMembers, patchChannel} from 'mattermost-redux/actions/channels';
import {
    getGroupsAssociatedToChannel as fetchAssociatedGroups,
    linkGroupSyncable,
    unlinkGroupSyncable,
} from 'mattermost-redux/actions/groups';

import {connect} from 'react-redux';

import {setNavigationBlocked} from 'actions/admin_actions';

import ChannelDetails from './channel_details';

function mapStateToProps(state, props) {
    const channelID = props.match.params.channel_id;
    const channel = getChannel(state, channelID) || {};
    const groups = getGroupsAssociatedToChannel(state, channelID);
    const allGroups = getAllGroups(state, channel.team_id);
    const totalGroups = state.entities.channels.groupsAssociatedToChannel && state.entities.channels.groupsAssociatedToChannel[channelID] ? state.entities.channels.groupsAssociatedToChannel[channelID].totalCount : 0;
    return {
        channel,
        allGroups,
        totalGroups,
        groups,
        channelID,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getChannel: fetchChannel,
            getGroups: fetchAssociatedGroups,
            linkGroupSyncable,
            unlinkGroupSyncable,
            membersMinusGroupMembers,
            patchChannel,
            setNavigationBlocked,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelDetails);
