// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getPostsSince, getPostsBefore} from 'mattermost-redux/actions/posts';

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
    return (dispatch) => {
        dispatch({
            type: ActionTypes.CHANNEL_POSTS_STATUS,
            data: params,
        });
    };
}

export function syncChannelPosts({channelId, since, beforeId}) {
    return async (dispatch, doGetState) => {
        const postsStatus = doGetState().views.channel.channelPostsStatus;
        const atEnd = postsStatus && postsStatus[channelId].atEnd;
        if (atEnd) {
            return getPostsSince(channelId, since)(dispatch, doGetState);
        }
        return getPostsBefore(channelId, beforeId, 0, POST_INCREASE_AMOUNT)(dispatch, doGetState);
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
