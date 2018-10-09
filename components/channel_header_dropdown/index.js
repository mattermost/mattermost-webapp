// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {
    getCurrentUser,
    getUserStatuses,
} from 'mattermost-redux/selectors/entities/users';
import {
    getCurrentChannel,
    getMyCurrentChannelMembership,
    isCurrentChannelReadOnly,
} from 'mattermost-redux/selectors/entities/channels';
import {getMyPreferences} from 'mattermost-redux/selectors/entities/preferences';
import {
    isDefault as isDefaultChannel,
    isFavoriteChannel,
    isChannelMuted,
} from 'mattermost-redux/utils/channel_utils';

import {Constants} from 'utils/constants';
import * as Utils from 'utils/utils';

import {default as Desktop} from './channel_header_dropdown';
import {default as Mobile} from './mobile_channel_header_dropdown';

const isCurrentChannelDefault = createSelector(
    getCurrentChannel,
    (channel) => isDefaultChannel(channel),
);

const isCurrentChannelFavorite = createSelector(
    getMyPreferences,
    getCurrentChannel,
    (preferences, channel) => isFavoriteChannel(preferences, channel.id) || false,
);

const isCurrentChannelMuted = createSelector(
    getMyCurrentChannelMembership,
    (membership) => isChannelMuted(membership),
);

const isCurrentChannelArchived = createSelector(
    getCurrentChannel,
    (channel) => channel.delete_at !== 0,
);

const getTeammateId = createSelector(
    getCurrentChannel,
    (channel) => {
        if (channel.type !== Constants.DM_CHANNEL) {
            return null;
        }

        return Utils.getUserIdFromChannelName(channel);
    },
);

const getTeammateStatus = createSelector(
    getUserStatuses,
    getTeammateId,
    (userStatuses, teammateId) => {
        if (!teammateId) {
            return null;
        }

        return userStatuses[teammateId];
    }
);

const mapStateToProps = createSelector(
    getCurrentUser,
    getCurrentChannel,
    isCurrentChannelDefault,
    isCurrentChannelFavorite,
    isCurrentChannelMuted,
    isCurrentChannelReadOnly,
    isCurrentChannelArchived,
    getTeammateId,
    getTeammateStatus,
    (
        user,
        channel,
        isDefault,
        isFavorite,
        isMuted,
        isReadonly,
        isArchived,
        teammateId,
        teammateStatus,
    ) => ({
        user,
        channel,
        isDefault,
        isFavorite,
        isMuted,
        isReadonly,
        isArchived,
        teammateId,
        teammateStatus,
    }),
);

export const ChannelHeaderDropdown = connect(mapStateToProps)(Desktop);
export const MobileChannelHeaderDropdown = connect(mapStateToProps)(Mobile);
