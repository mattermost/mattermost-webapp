// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';
import {getRecentPostsChunkInChannel, makeGetPostsChunkAroundPost, getUnreadPostsChunk, getPost} from 'mattermost-redux/selectors/entities/posts';
import {isManuallyUnread} from 'mattermost-redux/selectors/entities/channels';
import {memoizeResult} from 'mattermost-redux/utils/helpers';
import {markChannelAsRead, markChannelAsViewed} from 'mattermost-redux/actions/channels';
import {makePreparePostIdsForPostList} from 'mattermost-redux/utils/post_list';
import {RequestStatus} from 'mattermost-redux/constants';

import {updateNewMessagesAtInChannel} from 'actions/global_actions.jsx';
import {getLatestPostId, makeCreateAriaLabelForPost} from 'utils/post_utils.jsx';
import {
    checkAndSetMobileView,
    loadPosts,
    loadUnreads,
    loadPostsAround,
    syncPostsInChannel,
    loadLatestPosts,
} from 'actions/views/channel';

import PostList from './post_list.jsx';

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
        let atOldestPost = false;
        let formattedPostIds;
        let latestAriaLabelFunc;
        const {focusedPostId, unreadChunkTimeStamp, channelId} = ownProps;
        const channelViewState = state.views.channel;
        const lastViewedAt = channelViewState.lastChannelViewTime[channelId];
        const isPrefetchingInProcess = channelViewState.channelPrefetchStatus[channelId] === RequestStatus.STARTED;
        const channelManuallyUnread = isManuallyUnread(state, channelId);

        if (focusedPostId && unreadChunkTimeStamp !== '') {
            chunk = getPostsChunkAroundPost(state, focusedPostId, channelId);
        } else if (unreadChunkTimeStamp) {
            chunk = getUnreadPostsChunk(state, channelId, unreadChunkTimeStamp);
        } else {
            chunk = getRecentPostsChunkInChannel(state, channelId);
        }

        if (chunk) {
            postIds = chunk.order;
            atLatestPost = chunk.recent;
            atOldestPost = chunk.oldest;
        }

        if (postIds) {
            formattedPostIds = preparePostIdsForPostList(state, {postIds, lastViewedAt, indicateNewMessages: true, channelId});
            if (postIds.length) {
                const latestPostId = memoizedGetLatestPostId(postIds);
                const latestPost = getPost(state, latestPostId);
                latestPostTimeStamp = latestPost.create_at;
                latestAriaLabelFunc = createAriaLabelForPost(state, latestPost);
            }
        }

        return {
            lastViewedAt,
            isFirstLoad: isFirstLoad(state, channelId),
            formattedPostIds,
            atLatestPost,
            atOldestPost,
            latestPostTimeStamp,
            postListIds: postIds,
            latestAriaLabelFunc,
            isPrefetchingInProcess,
            channelManuallyUnread,
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
            markChannelAsViewed,
            markChannelAsRead,
            updateNewMessagesAtInChannel,
        }, dispatch),
    };
}

export default withRouter(connect(makeMapStateToProps, mapDispatchToProps)(PostList));
