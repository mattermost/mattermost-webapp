// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {
    getPostIdsInChannel,
    makeGetPostIdsAroundPost,
    getPost,
} from 'mattermost-redux/selectors/entities/posts';
import {makePreparePostIdsForPostList} from 'mattermost-redux/utils/post_list';
import {memoizeResult} from 'mattermost-redux/utils/helpers';

import {getLatestPostId} from 'utils/post_utils.jsx';

import PostList from './post_list_virtualized.jsx';

const memoizedGetLatestPostId = memoizeResult((postIds) => getLatestPostId(postIds));

function makeMapStateToProps() {
    const getPostIdsAroundPost = makeGetPostIdsAroundPost();
    const preparePostIdsForPostList = makePreparePostIdsForPostList();
    return function mapStateToProps(state, ownProps) {
        let postIds;
        let postListChunk;
        let latestPostTimeStamp = 0;
        const lastViewedAt = state.views.channel.lastChannelViewTime[ownProps.channelId];
        if (ownProps.focusedPostId) {
            postListChunk = getPostIdsAroundPost(state, ownProps.focusedPostId, ownProps.channelId, {postsBeforeCount: -1});
        } else {
            postListChunk = getPostIdsInChannel(state, ownProps.channelId);
        }

        if (postListChunk && postListChunk.length) {
            postIds = preparePostIdsForPostList(state, {postIds: postListChunk, lastViewedAt, indicateNewMessages: true});
            const latestPostId = memoizedGetLatestPostId(postIds);
            const latestPost = getPost(state, latestPostId);
            latestPostTimeStamp = latestPost.create_at;
        }

        return {
            postListIds: postIds,
            latestPostTimeStamp,
            postListChunk,
        };
    };
}

export default connect(makeMapStateToProps)(PostList);
