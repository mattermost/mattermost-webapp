// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';

import {getGroupsForReference, getGroupsAssociatedToChannelForReference, getGroupsAssociatedToTeamForReference} from 'mattermost-redux/selectors/entities/groups';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {getCurrentUserId, makeGetProfilesInChannel, makeGetProfilesNotInChannel} from 'mattermost-redux/selectors/entities/users';

import {autocompleteUsersInChannel} from 'actions/views/channel';
import {autocompleteChannels} from 'actions/channel_actions';

import Textbox from './textbox.jsx';

const makeMapStateToProps = (state, ownProps) => {
    const getProfilesInChannel = makeGetProfilesInChannel();
    const getProfilesNotInChannel = makeGetProfilesNotInChannel();

    const team = getCurrentTeam(state);
    const channel = getCurrentChannel(state);

    let autocompleteGroups = [];

    if (team?.group_constrained && channel?.group_constrained) {
        const groupsFromChannel = getGroupsAssociatedToChannelForReference(state, channel.id);
        const groupsFromTeam = getGroupsAssociatedToTeamForReference(state, team.id);
        autocompleteGroups = groupsFromChannel.concat(groupsFromTeam.filter((item) => groupsFromChannel.indexOf(item) < 0));
    } else if (team?.group_constrained) {
        autocompleteGroups = getGroupsAssociatedToTeamForReference(state, team.id);
    } else if (channel?.group_constrained) {
        autocompleteGroups = getGroupsAssociatedToChannelForReference(state, channel.id);
    } else {
        autocompleteGroups = getGroupsForReference(state);
    }

    return {
        currentUserId: getCurrentUserId(state),
        profilesInChannel: getProfilesInChannel(state, ownProps.channelId, true),
        profilesNotInChannel: getProfilesNotInChannel(state, ownProps.channelId, true),
        autocompleteGroups,
    };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        autocompleteUsersInChannel,
        autocompleteChannels,
    }, dispatch),
});

export default connect(makeMapStateToProps, mapDispatchToProps, null, {withRef: true})(Textbox);
