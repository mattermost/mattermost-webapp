// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {getAssociatedGroupsForReference} from 'mattermost-redux/selectors/entities/groups';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {getCurrentUserId, makeGetProfilesInChannel, makeGetProfilesNotInChannel} from 'mattermost-redux/selectors/entities/users';

import {autocompleteUsersInChannel} from 'actions/views/channel';
import {searchAssociatedGroupsForReference} from 'actions/views/group';
import {autocompleteChannels} from 'actions/channel_actions';

import Textbox from './textbox.jsx';

/* eslint-disable camelcase */

const makeMapStateToProps = (state, ownProps) => {
    const getProfilesInChannel = makeGetProfilesInChannel();
    const getProfilesNotInChannel = makeGetProfilesNotInChannel();

    const teamId = getCurrentTeamId(state);
    const channelId = getCurrentChannelId(state);

    return {
        currentUserId: getCurrentUserId(state),
        currentTeamId: teamId,
        profilesInChannel: getProfilesInChannel(state, ownProps.channelId, true),
        profilesNotInChannel: getProfilesNotInChannel(state, ownProps.channelId, true),
        autocompleteGroups: getAssociatedGroupsForReference(state, teamId, channelId),
    };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        autocompleteUsersInChannel,
        autocompleteChannels,
        searchAssociatedGroupsForReference,
    }, dispatch),
});

export default connect(makeMapStateToProps, mapDispatchToProps, null, {withRef: true})(Textbox);
