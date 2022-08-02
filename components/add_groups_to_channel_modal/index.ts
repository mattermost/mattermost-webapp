// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {getGroupsNotAssociatedToChannel, linkGroupSyncable, getAllGroupsAssociatedToChannel, getAllGroupsAssociatedToTeam} from 'mattermost-redux/actions/groups';
import {getTeam} from 'mattermost-redux/actions/teams';
import {getGroupsNotAssociatedToChannel as selectGroupsNotAssociatedToChannel} from 'mattermost-redux/selectors/entities/groups';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';

import {Channel} from 'mattermost-redux/types/channels';
import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {Group} from 'mattermost-redux/types/groups';

import {GlobalState} from 'types/store';
import {setModalSearchTerm} from 'actions/views/search';

import AddGroupsToChannelModal, {Props} from './add_groups_to_channel_modal';

type OwnProps = {
    channel: Channel;
    skipCommit: boolean;
    onAddCallback: (groupIDs: string[]) => void;
    excludeGroups: Group[];
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
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

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc| GenericAction>, Props['actions']>({
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
