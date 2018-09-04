// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getPostsSince, getPostsBefore} from 'mattermost-redux/actions/posts';
import {getNewestPostIdFromPosts, getOldestPostIdFromPosts} from 'mattermost-redux/utils/post_utils';

import {isMobile} from 'utils/utils.jsx';
import {ActionTypes, Constants} from 'utils/constants.jsx';

const POST_INCREASE_AMOUNT = Constants.POST_CHUNK_SIZE / 2;

export function checkAndSetMobileView() {
    return (dispatch) => {
        dispatch({
            type: ActionTypes.UPDATE_MOBILE_VIEW,
            data: isMobile(),
        });
    };
}

export function changeChannelPostsStatus(params) {
    // takes params in the format of {channelId, atEnd: true/false} or {channelId, atStart: true/false}

    return (dispatch) => {
        dispatch({
            type: ActionTypes.CHANNEL_POSTS_STATUS,
            data: params,
        });
    };
}

export function channelSyncCompleted(channelId) {
    return async (dispatch) => {
        dispatch({
            type: ActionTypes.CHANNEL_SYNC_STATUS,
            data: channelId,
        });
    };
}

export function syncChannelPosts({channelId, channelPostsStatus, lastDisconnectAt, posts}) {
    return async (dispatch) => {
        if (channelPostsStatus.atEnd) {
            await dispatch(getPostsSince(channelId, lastDisconnectAt));
        } else {
            let data;
            const oldestPostId = getOldestPostIdFromPosts(posts);
            let newestMessageId = getNewestPostIdFromPosts(posts);
            do {
                ({data} = await dispatch(getPostsBefore(channelId, newestMessageId, 0, POST_INCREASE_AMOUNT))); // eslint-disable-line no-await-in-loop
                newestMessageId = data.order[data.order.length - 1];
            } while (data && !data.posts[oldestPostId]);
        }
        dispatch(channelSyncCompleted(channelId));
    };
}
