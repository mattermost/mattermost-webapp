// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {GlobalState} from 'mattermost-redux/types/store';

import SidebarChannelMenu from './sidebar_channel_menu';
import { Channel } from 'mattermost-redux/types/channels';
import {isChannelMuted, isFavoriteChannel} from 'mattermost-redux/utils/channel_utils';
import { getMyPreferences } from 'mattermost-redux/selectors/entities/preferences';
import {getMyChannelMemberships, getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {favoriteChannel, unfavoriteChannel, updateChannelNotifyProps, markChannelAsRead} from 'mattermost-redux/actions/channels';
import {makeGetCategoriesForTeam} from 'mattermost-redux/selectors/entities/channel_categories';
import { Dispatch, bindActionCreators } from 'redux';
import { getCurrentTeam } from 'mattermost-redux/selectors/entities/teams';
import {openModal} from 'actions/views/modals';

type OwnProps = {
    channel: Channel;
    isUnread: boolean;
}

function makeMapStateToProps() {
    const getCategoriesForTeam = makeGetCategoriesForTeam();

    return (state: GlobalState, ownProps: OwnProps) => {
        const preferences = getMyPreferences(state);
        const member = getMyChannelMemberships(state)[ownProps.channel.id];
        const currentTeam = getCurrentTeam(state);

        return {
            currentUserId: getCurrentUserId(state),
            categories: getCategoriesForTeam(state, currentTeam.id),
            isFavorite: isFavoriteChannel(preferences, ownProps.channel.id),
            isMuted: isChannelMuted(member),
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            markChannelAsRead,
            favoriteChannel,
            unfavoriteChannel,
            updateChannelNotifyProps,
            openModal,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(SidebarChannelMenu);
