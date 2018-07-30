// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';
import {getPostsAfter, getPostsBefore, getPostThread, clearPostsFromChannel, backUpPostsInChannel} from 'mattermost-redux/actions/posts';
import {makeGetPostsInChannel, getPostIdsInCurrentChannel} from 'mattermost-redux/selectors/entities/posts';
import {get} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';

import {loadPosts, loadUnreads, addPostIdsFromBackUp} from 'actions/post_actions';
import {changeChannelPostsStatus, syncChannelPosts, channelSyncCompleted} from 'actions/views/channel';
import {makeGetChannelPostStatus, makeGetChannelSyncStatus} from 'selectors/views/channel';
import {makeGetSocketStatus} from 'selectors/views/websocket';
import {Preferences} from 'utils/constants.jsx';

import PostList from './post_list/index.jsx';

function makeMapStateToProps() {
    const getPostsInChannel = makeGetPostsInChannel();
    const getChannelPostStatus = makeGetChannelPostStatus();
    const getChannelSyncStatus = makeGetChannelSyncStatus();
    const getSocketStatus = makeGetSocketStatus();
    return function mapStateToProps(state, ownProps) {
        const postVisibility = state.views.channel.postVisibility[ownProps.channelId];
        const posts = getPostsInChannel(state, ownProps.channelId, postVisibility);
        const member = getMyChannelMemberships(state)[ownProps.channelId];
        return {
            lastViewedAt: state.views.channel.lastChannelViewTime[ownProps.channelId],
            posts,
            postVisibility,
            loadingPosts: state.views.channel.loadingPosts[ownProps.channelId],
            currentUserId: getCurrentUserId(state),
            fullWidth: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.CHANNEL_DISPLAY_MODE, Preferences.CHANNEL_DISPLAY_MODE_DEFAULT) === Preferences.CHANNEL_DISPLAY_MODE_FULL_SCREEN,
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
            getPostsBefore,
            getPostsAfter,
            getPostThread,
            loadUnreads,
            loadPosts,
            changeChannelPostsStatus,
            clearPostsFromChannel,
            addPostIdsFromBackUp,
            syncChannelPosts,
            backUpPostsInChannel,
            channelSyncCompleted,
        }, dispatch),
    };
}

export default withRouter(connect(makeMapStateToProps, mapDispatchToProps)(PostList));
