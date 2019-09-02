// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {makeGetPostsAroundPost, makeGetPostsInChannel} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {makeCombineUserActivityFromPosts} from 'selectors/posts';

import PostList from './post_list_ie.jsx';

function makeMapStateToProps() {
    const getPostsInChannel = makeGetPostsInChannel();
    const getPostsAroundPost = makeGetPostsAroundPost();
    const combineUserActivityPosts = makeCombineUserActivityFromPosts();
    return function mapStateToProps(state, ownProps) {
        let posts;
        const postVisibility = state.views.channel.postVisibility[ownProps.channelId];

        if (ownProps.focusedPostId) {
            posts = getPostsAroundPost(state, ownProps.focusedPostId, ownProps.channelId);
        } else {
            posts = getPostsInChannel(state, ownProps.channelId, postVisibility);
        }

        return {
            posts: combineUserActivityPosts(posts || []),
            currentUserId: getCurrentUserId(state),
            lastViewedAt: state.views.channel.lastChannelViewTime[ownProps.channelId],
            channel: getCurrentChannel(state),
            postVisibility,
        };
    };
}

export default connect(makeMapStateToProps)(PostList);
