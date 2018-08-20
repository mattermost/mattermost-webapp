// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';
import {getPostThread} from 'mattermost-redux/actions/posts';
import {makeGetPostsInChannel, getPostIdsInCurrentChannel} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';

import {loadPosts, loadUnreads, addPostIdsFromBackUp} from 'actions/post_actions';
import {changeChannelPostsStatus, channelSyncCompleted, syncChannelPosts, backupAndClearPostIds} from 'actions/views/channel';
import {makeGetChannelPostStatus, makeGetChannelSyncStatus} from 'selectors/views/channel';
import {getSocketStatus} from 'selectors/views/websocket';

import PostList from './post_view.jsx';

function makeMapStateToProps() {
    const getPostsInChannel = makeGetPostsInChannel();
    const getChannelPostStatus = makeGetChannelPostStatus();
    const getChannelSyncStatus = makeGetChannelSyncStatus();
    return function mapStateToProps(state, ownProps) {
        const postVisibility = state.views.channel.postVisibility[ownProps.channelId];
        const posts = getPostsInChannel(state, ownProps.channelId, postVisibility);
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
            addPostIdsFromBackUp,
            channelSyncCompleted,
            syncChannelPosts,
            backupAndClearPostIds,
        }, dispatch),
    };
}

export default withRouter(connect(makeMapStateToProps, mapDispatchToProps)(PostList));
