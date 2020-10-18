// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getChannel, getChannelModerations} from 'mattermost-redux/selectors/entities/channels';
import {getAllGroups, getGroupsAssociatedToChannel} from 'mattermost-redux/selectors/entities/groups';
import {getScheme} from 'mattermost-redux/selectors/entities/schemes';
import {getScheme as loadScheme} from 'mattermost-redux/actions/schemes';
import {
    getChannel as fetchChannel,
    membersMinusGroupMembers,
    patchChannel,
    updateChannelPrivacy,
    getChannelModerations as fetchChannelModerations,
    patchChannelModerations,
    addChannelMember,
    removeChannelMember,
    updateChannelMemberSchemeRoles,
    deleteChannel,
    unarchiveChannel,
} from 'mattermost-redux/actions/channels';
import {getTeam as fetchTeam} from 'mattermost-redux/actions/teams';

import {
    getGroupsAssociatedToChannel as fetchAssociatedGroups,
    linkGroupSyncable,
    unlinkGroupSyncable,
    patchGroupSyncable,
} from 'mattermost-redux/actions/groups';

import {connect} from 'react-redux';

import {getTeam} from 'mattermost-redux/selectors/entities/teams';

import {setNavigationBlocked} from 'actions/admin_actions';

import ChannelDetails from './channel_details';

function mapStateToProps(state, props) {
    const config = getConfig(state);
    const guestAccountsEnabled = config.EnableGuestAccounts === 'true';
    const channelID = props.match.params.channel_id;
    const channel = getChannel(state, channelID) || {};
    const team = getTeam(state, channel.team_id) || {};
    const groups = getGroupsAssociatedToChannel(state, channelID);
    const allGroups = getAllGroups(state, channel.team_id);
    const totalGroups = groups.length;
    const channelPermissions = getChannelModerations(state, channelID);
    const teamScheme = getScheme(state, team.scheme_id);
    return {
        channel,
        team,
        allGroups,
        totalGroups,
        groups,
        channelID,
        channelPermissions,
        teamScheme,
        guestAccountsEnabled,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            loadScheme,
            patchChannelModerations,
            getChannelModerations: fetchChannelModerations,
            getChannel: fetchChannel,
            getTeam: fetchTeam,
            getGroups: fetchAssociatedGroups,
            linkGroupSyncable,
            unlinkGroupSyncable,
            membersMinusGroupMembers,
            patchChannel,
            setNavigationBlocked,
            updateChannelPrivacy,
            patchGroupSyncable,
            addChannelMember,
            removeChannelMember,
            updateChannelMemberSchemeRoles,
            deleteChannel,
            unarchiveChannel,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelDetails);
