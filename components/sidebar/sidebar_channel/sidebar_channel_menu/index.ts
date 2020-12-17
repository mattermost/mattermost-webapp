// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {Dispatch, bindActionCreators, ActionCreatorsMapObject} from 'redux';

import {favoriteChannel, unfavoriteChannel, markChannelAsRead} from 'mattermost-redux/actions/channels';
import {addChannelToCategory} from 'mattermost-redux/actions/channel_categories';
import Permissions from 'mattermost-redux/constants/permissions';
import {isFavoriteChannel} from 'mattermost-redux/selectors/entities/channels';
import {getMyChannelMemberships, getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getCategoryInTeamWithChannel} from 'mattermost-redux/selectors/entities/channel_categories';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {ActionFunc} from 'mattermost-redux/types/actions';
import {Channel} from 'mattermost-redux/types/channels';
import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';

import {unmuteChannel, muteChannel} from 'actions/channel_actions';
import {openModal} from 'actions/views/modals';

import {getCategoriesForCurrentTeam} from 'selectors/views/channel_sidebar';

import {GlobalState} from 'types/store';

import {getSiteURL} from 'utils/url';

import SidebarChannelMenu from './sidebar_channel_menu';

type OwnProps = {
    channel: Channel;
    channelLink: string;
    isUnread: boolean;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const member = getMyChannelMemberships(state)[ownProps.channel.id];
    const currentTeam = getCurrentTeam(state);

    let managePublicChannelMembers = false;
    let managePrivateChannelMembers = false;
    let categories;
    let currentCategory;

    if (currentTeam) {
        managePublicChannelMembers = haveIChannelPermission(state, {channel: ownProps.channel.id, team: currentTeam.id, permission: Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS});
        managePrivateChannelMembers = haveIChannelPermission(state, {channel: ownProps.channel.id, team: currentTeam.id, permission: Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS});
        categories = getCategoriesForCurrentTeam(state);
        currentCategory = getCategoryInTeamWithChannel(state, currentTeam.id, ownProps.channel.id);
    }

    return {
        currentTeamId: currentTeam.id,
        currentUserId: getCurrentUserId(state),
        categories,
        currentCategory,
        isFavorite: isFavoriteChannel(state, ownProps.channel.id),
        isMuted: isChannelMuted(member),
        channelLink: `${getSiteURL()}${ownProps.channelLink}`,
        managePublicChannelMembers,
        managePrivateChannelMembers,
    };
}

type Actions = {
    markChannelAsRead: (channelId: string) => void;
    favoriteChannel: (channelId: string) => void;
    unfavoriteChannel: (channelId: string) => void;
    muteChannel: (userId: string, channelId: string) => void;
    unmuteChannel: (userId: string, channelId: string) => void;
    openModal: (modalData: any) => void;
    addChannelToCategory: (categoryId: string, channelId: string) => void;
};

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            markChannelAsRead,
            favoriteChannel,
            unfavoriteChannel,
            muteChannel,
            unmuteChannel,
            openModal,
            addChannelToCategory,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarChannelMenu);
