// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {createSelector} from 'reselect';

import {getAllChannels, joinChannel} from 'mattermost-redux/actions/channels';
import {getMyChannels} from 'mattermost-redux/selectors/entities/channels';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {RequestStatus} from 'mattermost-redux/constants';
import {moveToChannelPost, removePost} from 'mattermost-redux/actions/posts';

import {searchMoreChannels} from 'actions/channel_actions.jsx';

import MoveToChannelPostModal from './move_to_channel_post_modal.jsx';

const getMyOwnChannels = createSelector(
    getMyChannels,
    (channels) => channels && channels.filter((c) => c.delete_at === 0)
);

function mapStateToProps(state, ownProps) {
    const team = getCurrentTeam(state) || {};

    const channel = getChannel(state, ownProps.post.channel_id);
    let currentChannelName = '';
    if (channel) {
        currentChannelName = channel.name;
    }

    //const {focusedPostId} = state.views.channel;
    //var latestPostId = ownProps.latestPostId;

    return {
        channels: getMyOwnChannels(state) || [],
        currentUserId: getCurrentUserId(state),
        teamId: team.id,
        currentChannelName : currentChannelName,
        teamName: team.name,
        channelsRequestStarted: state.requests.channels.getChannels.status === RequestStatus.STARTED,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getAllChannels,
            joinChannel,
            searchMoreChannels,
            moveToChannelPost,
            removePost
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MoveToChannelPostModal);
