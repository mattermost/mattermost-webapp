// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';
import {ChannelTypes, PostTypes, UserTypes} from 'mattermost-redux/action_types';

import {ActionTypes, Constants, NotificationLevels} from 'utils/constants.jsx';

function postVisibility(state = {}, action) {
    switch (action.type) {
    case ChannelTypes.SELECT_CHANNEL: {
        const nextState = {...state};
        nextState[action.data] = Constants.POST_CHUNK_SIZE / 2;
        return nextState;
    }
    case ActionTypes.INCREASE_POST_VISIBILITY: {
        const nextState = {...state};
        nextState[action.data] += action.amount;
        return nextState;
    }
    case ActionTypes.RECEIVED_FOCUSED_POST: {
        const nextState = {...state};
        nextState[action.channelId] = Constants.POST_CHUNK_SIZE / 2;
        return nextState;
    }
    case PostTypes.RECEIVED_POST: {
        if (action.data && state[action.data.channel_id]) {
            const nextState = {...state};
            nextState[action.data.channel_id] += 1;
            return nextState;
        }
        return state;
    }
    default:
        return state;
    }
}

function lastChannelViewTime(state = {}, action) {
    switch (action.type) {
    case ActionTypes.SELECT_CHANNEL_WITH_MEMBER: {
        if (action.member) {
            const nextState = {...state};
            nextState[action.data] = action.member.last_viewed_at;
            return nextState;
        }
        return state;
    }

    default:
        return state;
    }
}

function loadingPosts(state = {}, action) {
    switch (action.type) {
    case ActionTypes.LOADING_POSTS: {
        const nextState = {...state};
        nextState[action.channelId] = action.data;
        return nextState;
    }
    default:
        return state;
    }
}

function focusedPostId(state = '', action) {
    switch (action.type) {
    case ActionTypes.RECEIVED_FOCUSED_POST:
        return action.data;
    case ChannelTypes.SELECT_CHANNEL:
        return '';
    default:
        return state;
    }
}

function mobileView(state = false, action) {
    switch (action.type) {
    case ActionTypes.UPDATE_MOBILE_VIEW:
        return action.data;
    default:
        return state;
    }
}

function keepChannelIdAsUnread(state = null, action) {
    switch (action.type) {
    case ActionTypes.SELECT_CHANNEL_WITH_MEMBER: {
        const member = action.member;
        const channel = action.channel;

        if (!member || !channel) {
            return state;
        }

        const msgCount = channel.total_msg_count - member.msg_count;
        const hadMentions = member.mention_count > 0;
        const hadUnreads = member.notify_props.mark_unread !== NotificationLevels.MENTION && msgCount > 0;

        if (hadMentions || hadUnreads) {
            return {
                id: member.channel_id,
                hadMentions,
            };
        }

        return null;
    }

    case UserTypes.LOGOUT_SUCCESS:
        return null;
    default:
        return state;
    }
}

export default combineReducers({
    postVisibility,
    lastChannelViewTime,
    loadingPosts,
    focusedPostId,
    mobileView,
    keepChannelIdAsUnread,
});
