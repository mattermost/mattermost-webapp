// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {
    getUser,
    getCurrentUser,
    getUserStatuses,
} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {
    getCurrentChannel,
    isCurrentChannelDefault,
    isCurrentChannelFavorite,
    isCurrentChannelMuted,
    isCurrentChannelArchived,
    isCurrentChannelReadOnly,
    getRedirectChannelNameForTeam,
} from 'mattermost-redux/selectors/entities/channels';

import {getPenultimateViewedChannelName} from 'selectors/local_storage';

import {Constants} from 'utils/constants';
import * as Utils from 'utils/utils';

import Desktop from './channel_header_dropdown';
import Items from './channel_header_dropdown_items';
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
    penultimateViewedChannelName: getPenultimateViewedChannelName(state) || getRedirectChannelNameForTeam(state, getCurrentTeamId(state)),
});

const mobileMapStateToProps = (state) => {
    const user = getCurrentUser(state);
    const channel = getCurrentChannel(state);
    const teammateId = getTeammateId(state);

    let teammateIsBot = false;
    if (teammateId) {
        const teammate = getUser(state, teammateId);
        teammateIsBot = teammate && teammate.is_bot;
    }

    return {
        user,
        channel,
        teammateId,
        teammateIsBot,
        teammateStatus: getTeammateStatus(state),
    };
};

export const ChannelHeaderDropdown = Desktop;
export const ChannelHeaderDropdownItems = connect(mapStateToProps)(Items);
export const MobileChannelHeaderDropdown = connect(mobileMapStateToProps)(Mobile);
