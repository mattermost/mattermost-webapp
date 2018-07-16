// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

export const makeGetChannelPostStatus = () => createSelector(
    (state) => state.views.channel.channelPostsStatus,
    (_, channel) => (channel.id),
    (channelPostsStatus, channelId) => {
        return channelPostsStatus[channelId];
    },
);

export const makeGetChannelSyncStatus = () => createSelector(
    (state) => state.views.channel.channelSyncStatus,
    (_, channel) => (channel.id),
    (channelSyncStatus, channelId) => {
        return channelSyncStatus[channelId];
    },
);
