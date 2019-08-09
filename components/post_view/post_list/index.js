// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';
import {getRecentPostsChunkInChannel, makeGetPostsChunkAroundPost, getUnreadPostsChunk, getPost} from 'mattermost-redux/selectors/entities/posts';
import {memoizeResult} from 'mattermost-redux/utils/helpers';
import {makePreparePostIdsForPostList} from 'mattermost-redux/utils/post_list';

import {getLatestPostId, makeCreateAriaLabelForPost} from 'utils/post_utils.jsx';
import {
    checkAndSetMobileView,
    loadPosts,
    loadUnreads,
    loadPostsAround,
    syncPostsInChannel,
    loadLatestPosts,
} from 'actions/views/channel';

import {disableVirtList} from 'utils/utils.jsx';

import IePostList from '../post_list_ie';

import PostListWrapper from './post_list.jsx';

let PostList = PostListWrapper;
if (disableVirtList()) {
    PostList = IePostList;
}

const isFirstLoad = (state, channelId) => !state.entities.posts.postsInChannel[channelId];
const memoizedGetLatestPostId = memoizeResult((postIds) => getLatestPostId(postIds));

// This function is added as a fail safe for the channel sync issue we have.
// When the user switches to a team for the first time we show the channel of previous team and then settle for the right channel after that
// This causes the scroll correction etc an issue because post_list is not mounted for new channel instead it is updated

function makeMapStateToProps() {
    const getPostsChunkAroundPost = makeGetPostsChunkAroundPost();
    const preparePostIdsForPostList = makePreparePostIdsForPostList();
    const createAriaLabelForPost = makeCreateAriaLabelForPost();

    return function mapStateToProps(state, ownProps) {
        let latestPostTimeStamp = 0;
        let postIds;
        let chunk;
        let atLatestPost = false;
        let formattedPostIds;
        let latestAriaLabelFunc;
        const lastViewedAt = state.views.channel.lastChannelViewTime[ownProps.channelId];

        if (ownProps.match.params.postid) {
            chunk = getPostsChunkAroundPost(state, ownProps.match.params.postid, ownProps.channelId);
        } else if (ownProps.unreadChunkTimeStamp) {
            chunk = getUnreadPostsChunk(state, ownProps.channelId, ownProps.unreadChunkTimeStamp);
        } else {
            chunk = getRecentPostsChunkInChannel(state, ownProps.channelId);
        }

        if (chunk) {
            postIds = chunk.order;
            atLatestPost = chunk.recent;
        }

        if (postIds) {
            formattedPostIds = preparePostIdsForPostList(state, {postIds, lastViewedAt, indicateNewMessages: true});
            if (postIds.length) {
                const latestPostId = memoizedGetLatestPostId(postIds);
                const latestPost = getPost(state, latestPostId);
                latestPostTimeStamp = latestPost.create_at;
                latestAriaLabelFunc = createAriaLabelForPost(state, latestPost);
            }
        }

        return {
            lastViewedAt,
            isFirstLoad: isFirstLoad(state, ownProps.channelId),
            formattedPostIds,
            atLatestPost,
            focusedPostId: ownProps.match.params.postid,
            latestPostTimeStamp,
            postListIds: postIds,
            latestAriaLabelFunc,
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            loadUnreads,
            loadPosts,
            loadLatestPosts,
            loadPostsAround,
            checkAndSetMobileView,
            syncPostsInChannel,
        }, dispatch),
    };
}

export default withRouter(connect(makeMapStateToProps, mapDispatchToProps)(PostList));
