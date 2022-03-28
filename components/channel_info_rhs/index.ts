// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {AnyAction, bindActionCreators, Dispatch} from 'redux';

import {getCurrentChannel, isCurrentChannelFavorite, isCurrentChannelMuted, isCurrentChannelArchived, getCurrentChannelStats} from 'mattermost-redux/selectors/entities/channels';
import {isModalOpen} from 'selectors/views/modals';

import {closeRightHandSide, showChannelFiles} from 'actions/views/rhs';

import {GlobalState} from 'types/store';

import {Constants, ModalIdentifiers} from 'utils/constants';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/common';
import {getIsMobileView} from 'selectors/views/browser';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {unfavoriteChannel, favoriteChannel} from 'mattermost-redux/actions/channels';
import {muteChannel, unmuteChannel} from 'actions/channel_actions';
import {openModal} from 'actions/views/modals';
import {getDisplayNameByUser, getUserIdFromChannelId} from 'utils/utils';
import {getProfilesInCurrentChannel, getStatusForUserId, getUser} from 'mattermost-redux/selectors/entities/users';
import {isGuest} from 'mattermost-redux/utils/user_utils';

import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';
import {Channel} from 'mattermost-redux/types/channels';

import RHS, {Props} from './channel_info_rhs';

function mapStateToProps(state: GlobalState) {
    const channel = getCurrentChannel(state);
    const currentUser = getCurrentUser(state);
    const currentTeam = getCurrentTeam(state);

    const channelStats = getCurrentChannelStats(state);

    // When we come back from the System console,
    // there's a few ms when we don't have a current channel yet
    if (!channel) {
        return {
            channel: {} as Channel,
            currentTeam,
            currentUser,
            isArchived: false,
            isFavorite: false,
            isMuted: false,
            isInvitingPeople: false,
            gmUsers: [],
            isPrivate: false,
            canManageMembers: false,
            canManageProperties: false,
        };
    }

    const isArchived = isCurrentChannelArchived(state);
    const isFavorite = isCurrentChannelFavorite(state);
    const isMuted = isCurrentChannelMuted(state);
    const isInvitingPeople = isModalOpen(state, ModalIdentifiers.CHANNEL_INVITE) || isModalOpen(state, ModalIdentifiers.CREATE_DM_CHANNEL);
    const isMobile = getIsMobileView(state);

    const gmUsers = getProfilesInCurrentChannel(state).filter((user) => {
        return user.id !== currentUser.id;
    });

    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    const canManageMembers = haveIChannelPermission(state, currentTeam.id, channel.id, isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS : Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS);
    const canManageProperties = haveIChannelPermission(state, currentTeam.id, channel.id, isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES : Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES);

    const props = {
        channel,
        currentUser,
        currentTeam,
        isArchived,
        isFavorite,
        isMuted,
        isInvitingPeople,
        isMobile,
        gmUsers,
        canManageMembers,
        canManageProperties,
        channelStats,
    } as Props;

    if (channel.type === Constants.DM_CHANNEL) {
        const user = getUser(state, getUserIdFromChannelId(channel.name, currentUser.id));
        props.dmUser = {
            user,
            display_name: getDisplayNameByUser(state, user),
            is_guest: isGuest(user.roles),
            status: getStatusForUserId(state, user.id),
        };
    }

    return props;
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
    return {
        actions: bindActionCreators({
            closeRightHandSide,
            unfavoriteChannel,
            favoriteChannel,
            unmuteChannel,
            muteChannel,
            openModal,
            showChannelFiles,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(RHS);
