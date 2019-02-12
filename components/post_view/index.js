// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getPosts, getPostsAfter, getPostsBefore, getPostThread} from 'mattermost-redux/actions/posts';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {makeGetPostsAroundPost, makeGetPostsInChannel} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {increasePostVisibility} from 'actions/post_actions.jsx';
import {checkAndSetMobileView} from 'actions/views/channel';
import {makePreparePostIdsForPostList} from 'selectors/posts';

import PostList from './post_list.jsx';

function makeMapStateToProps() {
    const getPostsInChannel = makeGetPostsInChannel();
    const getPostsAroundPost = makeGetPostsAroundPost();
    const preparePostIdsForPostList = makePreparePostIdsForPostList();

    return function mapStateToProps(state, ownProps) {
        const postVisibility = 500;

        let posts;
        if (ownProps.focusedPostId) {
            posts = getPostsAroundPost(state, ownProps.focusedPostId, ownProps.channelId);
        } else {
            posts = getPostsInChannel(state, ownProps.channelId, postVisibility);
        }

        const lastViewedAt = state.views.channel.lastChannelViewTime[ownProps.channelId];
        const postListIds = preparePostIdsForPostList(state, {posts, lastViewedAt, indicateNewMessages: true});

        return {
            channel: getChannel(state, ownProps.channelId) || {},
            lastViewedAt,
            posts,
            postVisibility,
            postListIds,
            loadingPosts: state.views.channel.loadingPosts[ownProps.channelId],
            focusedPostId: ownProps.focusedPostId,
            currentUserId: getCurrentUserId(state),
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getPosts,
            getPostsBefore,
            getPostsAfter,
            getPostThread,
            increasePostVisibility,
            checkAndSetMobileView,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(PostList);
