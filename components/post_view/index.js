// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {makeGetPostsInChannel, getPostIdsInCurrentChannel, makeGetPostsAroundPost} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';
import {getPostThread} from 'mattermost-redux/actions/posts';

import {loadPosts, loadUnreads} from 'actions/post_actions';
import {changeChannelPostsStatus, channelSyncCompleted, syncChannelPosts} from 'actions/views/channel';
import {makeGetChannelPostStatus, makeGetChannelSyncStatus} from 'selectors/views/channel';
import {getSocketStatus} from 'selectors/views/websocket';

import PostView from './post_view.jsx';

function makeMapStateToProps() {
    const getPostsInChannel = makeGetPostsInChannel();
    const getChannelPostStatus = makeGetChannelPostStatus();
    const getChannelSyncStatus = makeGetChannelSyncStatus();
    const getPostsAroundPost = makeGetPostsAroundPost();
    return function mapStateToProps(state, ownProps) {
        const postVisibility = state.views.channel.postVisibility[ownProps.channelId];

        let posts;
        if (ownProps.focusedPostId) {
            posts = getPostsAroundPost(state, ownProps.focusedPostId, ownProps.channelId);
        } else {
            posts = getPostsInChannel(state, ownProps.channelId, postVisibility);
        }

        const member = getMyChannelMemberships(state)[ownProps.channelId];
        return {
            lastViewedAt: state.views.channel.lastChannelViewTime[ownProps.channelId],
            posts,
            postVisibility,
            currentUserId: getCurrentUserId(state),
            member,
            channelPostsStatus: getChannelPostStatus(state, ownProps.channelId),
            postIdsInCurrentChannel: getPostIdsInCurrentChannel(state),
            channelSyncStatus: getChannelSyncStatus(state, ownProps.channelId),
            socketStatus: getSocketStatus(state),
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getPostThread,
            loadUnreads,
            loadPosts,
            changeChannelPostsStatus,
            channelSyncCompleted,
            syncChannelPosts,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(PostView);
