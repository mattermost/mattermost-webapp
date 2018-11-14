// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {linkGroupSyncable, unlinkGroupSyncable, getGroup as fetchGroup, getGroupMembers as fetchMembers, getGroupSyncables as fetchGroupSyncables} from 'mattermost-redux/actions/groups';
import {getGroup, getGroupTeams, getGroupChannels, getGroupMembers, getGroupMemberCount} from 'mattermost-redux/selectors/entities/groups';

import GroupDetails from './group_details.jsx';

function mapStateToProps(state, props) {
    const groupID = props.match.params.group_id;
    const group = getGroup(state, groupID);
    const groupTeams = getGroupTeams(state, groupID);
    const groupChannels = getGroupChannels(state, groupID);
    const members = getGroupMembers(state, groupID);
    const memberCount = getGroupMemberCount(state, groupID);

    return {
        groupID,
        group,
        groupTeams,
        groupChannels,
        members,
        memberCount,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getGroup: fetchGroup,
            getMembers: fetchMembers,
            getGroupSyncables: fetchGroupSyncables,
            link: linkGroupSyncable,
            unlink: unlinkGroupSyncable,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupDetails);
