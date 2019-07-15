// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getAllGroups, getGroupsAssociatedToChannel} from 'mattermost-redux/selectors/entities/groups';
import {convertChannelToPrivate, getChannel as fetchChannel, membersMinusGroupMembers, patchChannel} from 'mattermost-redux/actions/channels';

import {
    getGroupsAssociatedToChannel as fetchAssociatedGroups,
    linkGroupSyncable,
    unlinkGroupSyncable,
} from 'mattermost-redux/actions/groups';

import {connect} from 'react-redux';

import {getTeam} from 'mattermost-redux/selectors/entities/teams';

import {setNavigationBlocked} from 'actions/admin_actions';

import ChannelDetails from './channel_details';

function mapStateToProps(state, props) {
    const channelID = props.match.params.channel_id;
    const channel = getChannel(state, channelID) || {};
    const team = channel.team_id ? getTeam(state, channel.team_id) : {};
    const groups = getGroupsAssociatedToChannel(state, channelID);
    const associatedGroups = state.entities.channels.groupsAssociatedToChannel;
    const allGroups = getAllGroups(state, channel.team_id);
    const totalGroups = associatedGroups && associatedGroups[channelID] && associatedGroups[channelID].totalCount ? associatedGroups[channelID].totalCount : 0;
    return {
        channel,
        team,
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
            convertChannelToPrivate,
            linkGroupSyncable,
            unlinkGroupSyncable,
            membersMinusGroupMembers,
            patchChannel,
            setNavigationBlocked,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelDetails);
