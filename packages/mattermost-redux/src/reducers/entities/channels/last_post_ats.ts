// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {
    AdminTypes,
    ChannelTypes,
    PostTypes,
    SchemeTypes,
    UserTypes,
} from 'mattermost-redux/action_types';

import {General} from 'mattermost-redux/constants';

import {GenericAction} from 'mattermost-redux/types/actions';
import {
    Channel,
    ServerChannel,
} from 'mattermost-redux/types/channels';
import {Post} from 'mattermost-redux/types/posts';
import {RelationOneToOne} from 'mattermost-redux/types/utilities';

export default function lastPostAts(state: RelationOneToOne<Channel, number> = {}, action: GenericAction): RelationOneToOne<Channel, number> {
    switch (action.type) {
    case ChannelTypes.RECEIVED_CHANNEL: {
        const channel: ServerChannel = action.data;

        return updateLastPostAt(state, channel);
    }
    case AdminTypes.RECEIVED_DATA_RETENTION_CUSTOM_POLICY_CHANNELS: {
        const channels: ServerChannel[] = action.data.channels;

        return channels.reduce(updateLastPostAt, state);
    }
    case AdminTypes.RECEIVED_DATA_RETENTION_CUSTOM_POLICY_CHANNELS_SEARCH:
    case ChannelTypes.RECEIVED_CHANNELS:
    case ChannelTypes.RECEIVED_ALL_CHANNELS:
    case SchemeTypes.RECEIVED_SCHEME_CHANNELS: {
        const channels: ServerChannel[] = action.data;

        return channels.reduce(updateLastPostAt, state);
    }

    case ChannelTypes.LEAVE_CHANNEL: {
        const channel: ServerChannel | undefined = action.data;

        if (!channel || channel.type !== General.OPEN_CHANNEL) {
            return state;
        }

        const nextState = {...state};
        Reflect.deleteProperty(nextState, channel.id);
        return nextState;
    }

    case PostTypes.RECEIVED_NEW_POST: {
        const post: Post = action.data;

        if (!(post.channel_id in state)) {
            return state;
        }

        return {
            ...state,
            [post.channel_id]: Math.max(post.create_at, state[post.channel_id]),
        };
    }

    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

function updateLastPostAt(state: RelationOneToOne<Channel, number>, channel: ServerChannel) {
    const existing = state[channel.id];
    if (existing && existing === channel.last_post_at) {
        return state;
    }

    return {
        ...state,
        [channel.id]: channel.last_post_at,
    };
}
