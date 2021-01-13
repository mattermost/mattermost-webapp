// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {getCurrentChannelId, getUnreadChannels} from 'mattermost-redux/selectors/entities/channels';
import {memoizeResult} from 'mattermost-redux/utils/helpers';
import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';
import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';

import {Channel, ChannelMembership} from 'mattermost-redux/types/channels';
import {PostList} from 'mattermost-redux/types/posts';

import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {RelationOneToOne} from 'mattermost-redux/types/utilities';

import {GlobalState} from 'types/store';

import {prefetchChannelPosts} from 'actions/views/channel';
import {trackDMGMOpenChannels} from 'actions/user_actions';

import DataPrefetch from './data_prefetch';

type Actions = {
    prefetchChannelPosts: (channelId: string, delay?: number) => Promise<{data: PostList}>;
    trackDMGMOpenChannels: () => Promise<void>;
};

enum Priority {
    high = 1,
    medium,
    low
}

// function to return a queue obj with priotiy as key and array of channelIds as values.
// high priority has channels with mentions
// medium priority has channels with unreads
const prefetchQueue = memoizeResult((channels: Channel[], memberships: RelationOneToOne<Channel, ChannelMembership>) => {
    return channels.reduce((acc: Record<string, string[]>, channel: Channel) => {
        const channelId = channel.id;
        const membership = memberships[channelId];
        if (membership && !isChannelMuted(membership)) {
            if (membership.mention_count > 0) {
                return {
                    ...acc,
                    [Priority.high]: [...acc[Priority.high], channelId],
                };
            } else if (membership.notify_props && membership.notify_props.mark_unread !== 'mention' && channel.total_msg_count - membership.msg_count) {
                return {
                    ...acc,
                    [Priority.medium]: [...acc[Priority.medium], channelId],
                };
            }
        }
        return acc;
    }, {
        [Priority.high]: [], // 1 being high priority requests
        [Priority.medium]: [],
        [Priority.low]: [], //TODO: add chanenls such as fav.
    });
});

function mapStateToProps(state: GlobalState) {
    const lastUnreadChannel = state.views.channel.lastUnreadChannel;
    const memberships = getMyChannelMemberships(state);
    const unreadChannels = getUnreadChannels(state, lastUnreadChannel);
    const prefetchQueueObj = prefetchQueue(unreadChannels, memberships);
    const prefetchRequestStatus = state.views.channel.channelPrefetchStatus;

    return {
        prefetchQueueObj,
        prefetchRequestStatus,
        unreadChannels,
        currentChannelId: getCurrentChannelId(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            prefetchChannelPosts,
            trackDMGMOpenChannels,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataPrefetch);
