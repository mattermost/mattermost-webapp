// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {Dispatch, bindActionCreators} from 'redux';

import {favoriteChannel, unfavoriteChannel, updateChannelNotifyProps, markChannelAsRead} from 'mattermost-redux/actions/channels';
import Permissions from 'mattermost-redux/constants/permissions';
import {getMyChannelMemberships, getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {makeGetCategoriesForTeam} from 'mattermost-redux/selectors/entities/channel_categories';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getMyPreferences} from 'mattermost-redux/selectors/entities/preferences';
import {haveITeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {Channel} from 'mattermost-redux/types/channels';
import {GlobalState} from 'mattermost-redux/types/store';
import {isChannelMuted, isFavoriteChannel} from 'mattermost-redux/utils/channel_utils';

import {openModal} from 'actions/views/modals';
import {getSiteURL} from 'utils/url';

import SidebarChannelMenu from './sidebar_channel_menu';

type OwnProps = {
    channel: Channel;
    channelLink: string;
    isUnread: boolean;
}

function makeMapStateToProps() {
    const getCategoriesForTeam = makeGetCategoriesForTeam();

    return (state: GlobalState, ownProps: OwnProps) => {
        const preferences = getMyPreferences(state);
        const member = getMyChannelMemberships(state)[ownProps.channel.id];
        const currentTeam = getCurrentTeam(state);

        let managePublicChannelMembers = false;
        let managePrivateChannelMembers = false;

        if (currentTeam) {
            managePublicChannelMembers = haveITeamPermission(state, {team: currentTeam.id, permission: Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS});
            managePrivateChannelMembers = haveITeamPermission(state, {team: currentTeam.id, permission: Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS});
        }

        return {
            currentUserId: getCurrentUserId(state),
            categories: getCategoriesForTeam(state, currentTeam.id),
            isFavorite: isFavoriteChannel(preferences, ownProps.channel.id),
            isMuted: isChannelMuted(member),
            channelLink: `${getSiteURL()}/${ownProps.channelLink}`,
            managePublicChannelMembers,
            managePrivateChannelMembers,
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
