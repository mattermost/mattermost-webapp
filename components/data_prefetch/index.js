// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getCurrentChannelId, getUnreadChannels} from 'mattermost-redux/selectors/entities/channels';
import {memoizeResult} from 'mattermost-redux/utils/helpers';
import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';
import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';

import {prefetchChannelPosts} from 'actions/views/channel';

import DataPrefetch from './data_prefetch';

const prefetchQueue = memoizeResult((channels, memberships) => {
    return channels.reduce((acc, channel) => {
        const channelId = channel.id;
        if (!isChannelMuted(channelId)) {
            const membership = memberships[channelId];
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

function mapStateToProps(state) {
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

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            prefetchChannelPosts,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataPrefetch);
