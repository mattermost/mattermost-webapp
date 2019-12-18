// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {createSelector} from 'reselect';

import {Posts} from 'mattermost-redux/constants';
import {getAllPosts, getPostIdsInChannel} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {makePreparePostIdsForPostList} from 'mattermost-redux/utils/post_list';

import NewMessagesBelow from './new_messages_below';

export function makeCountUnreadsBelow() {
    return createSelector(
        getAllPosts,
        getCurrentUserId,
        (state, postIds) => postIds,
        (state, postIds, lastViewedBottom) => lastViewedBottom,
        (allPosts, currentUserId, postIds, lastViewedBottom) => {
            if (!postIds) {
                return 0;
            }

            // Count the number of new posts made by other users that haven't been deleted
            return postIds.map((id) => allPosts[id]).filter((post) => {
                return post &&
                    post.user_id !== currentUserId &&
                    post.state !== Posts.POST_DELETED &&
                    post.create_at > lastViewedBottom;
            }).length;
        }
    );
}

export function makeCountUnreadsBelowRHS() {
    return createSelector(
        getAllPosts,
        getCurrentUserId,
        (state, posts) => posts,
        (state, posts, lastViewedBottom) => lastViewedBottom,
        (allPosts, currentUserId, posts, lastViewedBottom) => {
            if (!posts) {
                return 0;
            }

            // Count the number of new posts made by other users that haven't been deleted
            return posts.map((post) => allPosts[post.id]).filter((post) => {
                return post &&
                    post.user_id !== currentUserId &&
                    post.state !== Posts.POST_DELETED &&
                    post.create_at > lastViewedBottom;
            }).length;
        }
    );
}

function makeMapStateToProps() {
    const countUnreadBelowRHS = makeCountUnreadsBelowRHS();
    const countUnreadsBelow = makeCountUnreadsBelow();
    const preparePostIdsForPostList = makePreparePostIdsForPostList();

    return (state, ownProps) => {
        if (ownProps.isRHS) {
            return {
                newMessages: countUnreadBelowRHS(state, ownProps.postArray, ownProps.lastViewedBottom),
            };
        }

        let postIds = getPostIdsInChannel(state, ownProps.channelId);

        if (postIds) {
            postIds = preparePostIdsForPostList(state, {postIds, lastViewedAt: ownProps.lastViewedBottom, channelId: ownProps.channelId});
        }

        return {
            newMessages: countUnreadsBelow(state, postIds, ownProps.lastViewedBottom),
        };
    };
}

export default connect(makeMapStateToProps)(NewMessagesBelow);
