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
    isCurrentChannelDefault,
    isCurrentChannelFavorite,
    isCurrentChannelMuted,
    isCurrentChannelArchived,
    isCurrentChannelReadOnly,
} from 'mattermost-redux/selectors/entities/channels';

import {Constants} from 'utils/constants';
import * as Utils from 'utils/utils';

import Desktop from './channel_header_dropdown';
import Mobile from './mobile_channel_header_dropdown';

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

const mapStateToProps = (state) => ({
    user: getCurrentUser(state),
    channel: getCurrentChannel(state),
    isDefault: isCurrentChannelDefault(state),
    isFavorite: isCurrentChannelFavorite(state),
    isMuted: isCurrentChannelMuted(state),
    isReadonly: isCurrentChannelReadOnly(state),
    isArchived: isCurrentChannelArchived(state),
    teammateId: getTeammateId(state),
    teammateStatus: getTeammateStatus(state),
});

export const ChannelHeaderDropdown = connect(mapStateToProps)(Desktop);
export const MobileChannelHeaderDropdown = connect(mapStateToProps)(Mobile);
