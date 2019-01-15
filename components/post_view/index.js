// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getPostThread} from 'mattermost-redux/actions/posts';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {makeGetPostsAroundPost, makeGetPostsInChannel, getPostIdsInCurrentChannel} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';

import {makeGetChannelPostStatus, makeGetChannelSyncStatus} from 'selectors/views/channel';
import {loadPosts, loadUnreads} from 'actions/post_actions';
import {changeChannelPostsStatus, channelSyncCompleted, syncChannelPosts, checkAndSetMobileView} from 'actions/views/channel';
import {getSocketStatus} from 'selectors/views/websocket';

import PostView from './post_view.jsx';

function makeMapStateToProps() {
    const getPostsInChannel = makeGetPostsInChannel();
    const getPostsAroundPost = makeGetPostsAroundPost();
    const getChannelPostStatus = makeGetChannelPostStatus();
    const getChannelSyncStatus = makeGetChannelSyncStatus();

    return function mapStateToProps(state, ownProps) {
        const postVisibility = state.views.channel.postVisibility[ownProps.channelId];
        const member = getMyChannelMemberships(state)[ownProps.channelId];

        let posts;
        if (ownProps.focusedPostId) {
            posts = getPostsAroundPost(state, ownProps.focusedPostId, ownProps.channelId);
        } else {
            posts = getPostsInChannel(state, ownProps.channelId, postVisibility);
        }

        return {
            channel: getChannel(state, ownProps.channelId) || {},
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
            checkAndSetMobileView,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(PostView);
