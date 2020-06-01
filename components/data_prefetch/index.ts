// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {getCurrentChannelId, getUnreadChannels} from 'mattermost-redux/selectors/entities/channels';
import {memoizeResult} from 'mattermost-redux/utils/helpers';
import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';
import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';

import {Channel, ChannelMembership} from 'mattermost-redux/types/channels';

import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {RelationOneToOne} from 'mattermost-redux/types/utilities';

import {GlobalState} from 'types/store';

import {prefetchChannelPosts} from 'actions/views/channel';

import DataPrefetch from './data_prefetch';

type Actions = {
    prefetchChannelPosts: (channelId: string, delay: number | undefined) => Promise<{data: {}}>;
};

const prefetchQueue = memoizeResult((channels: Channel[], memberships: RelationOneToOne<Channel, ChannelMembership>) => {
    return channels.reduce((acc: Record<string, string[]>, channel: Channel) => {
        const channelId = channel.id;
        const membership = memberships[channelId];
        if (!isChannelMuted(membership)) {
            if (membership.mention_count > 0) {
                return {
                    ...acc,
                    1: [...acc[1], channelId],
                };
            } else if (membership.notify_props && membership.notify_props.mark_unread !== 'mention' && channel.total_msg_count - membership.msg_count) {
                return {
                    ...acc,
                    2: [...acc[2], channelId],
                };
            }
        }
        return acc;
    }, {
        1: [], // 1 being high priority requests
        2: [],
        3: [], //TODO: add chanenls such as fav.
    });
});

function mapStateToProps(state: GlobalState) {
    const lastUnreadChannel = state.views.channel.keepChannelIdAsUnread;
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
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataPrefetch);
