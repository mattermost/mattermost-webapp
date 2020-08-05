// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getGroupsNotAssociatedToChannel, linkGroupSyncable, getAllGroupsAssociatedToChannel, getAllGroupsAssociatedToTeam} from 'mattermost-redux/actions/groups';
import {getTeam} from 'mattermost-redux/actions/teams';
import {getGroupsNotAssociatedToChannel as selectGroupsNotAssociatedToChannel} from 'mattermost-redux/selectors/entities/groups';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';

import {setModalSearchTerm} from 'actions/views/search';

import AddGroupsToChannelModal from './add_groups_to_channel_modal';

function mapStateToProps(state, ownProps) {
    const searchTerm = state.views.search.modalSearch;

    const channel = ownProps.channel || getCurrentChannel(state) || {};

    let groups = selectGroupsNotAssociatedToChannel(state, channel.id, channel.team_id);
    if (searchTerm) {
        const regex = RegExp(searchTerm, 'i');
        groups = groups.filter((group) => regex.test(group.display_name) || regex.test(group.name));
    }

    return {
        currentChannelName: channel.display_name,
        currentChannelId: channel.id,
        skipCommit: ownProps.skipCommit,
        onAddCallback: ownProps.onAddCallback,
        excludeGroups: ownProps.excludeGroups,
        searchTerm,
        groups,
        teamID: channel.team_id,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getGroupsNotAssociatedToChannel,
            setModalSearchTerm,
            linkGroupSyncable,
            getAllGroupsAssociatedToChannel,
            getTeam,
            getAllGroupsAssociatedToTeam,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddGroupsToChannelModal);
