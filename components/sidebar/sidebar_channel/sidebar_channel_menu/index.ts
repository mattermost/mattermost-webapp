// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {Dispatch, bindActionCreators} from 'redux';

import {favoriteChannel, unfavoriteChannel, markChannelAsRead} from 'mattermost-redux/actions/channels';
import {addChannelToCategory} from 'mattermost-redux/actions/channel_categories';
import Permissions from 'mattermost-redux/constants/permissions';
import {getMyChannelMemberships, getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {makeGetCategoriesForTeam, getCategoryInTeamWithChannel} from 'mattermost-redux/selectors/entities/channel_categories';
import {getMyPreferences} from 'mattermost-redux/selectors/entities/preferences';
import {haveITeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {Channel} from 'mattermost-redux/types/channels';
import {isChannelMuted, isFavoriteChannel} from 'mattermost-redux/utils/channel_utils';

import {unmuteChannel, muteChannel} from 'actions/channel_actions';
import {createCategory} from 'actions/views/channel_sidebar';
import {openModal} from 'actions/views/modals';
import {GlobalState} from 'types/store';
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
        let categories;
        let currentCategory;

        if (currentTeam) {
            managePublicChannelMembers = haveITeamPermission(state, {team: currentTeam.id, permission: Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS});
            managePrivateChannelMembers = haveITeamPermission(state, {team: currentTeam.id, permission: Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS});
            categories = getCategoriesForTeam(state, currentTeam.id);
            currentCategory = getCategoryInTeamWithChannel(state, currentTeam.id, ownProps.channel.id);
        }

        return {
            currentTeamId: currentTeam.id,
            currentUserId: getCurrentUserId(state),
            categories,
            currentCategory,
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
            createCategory,
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

export default connect(makeMapStateToProps, mapDispatchToProps)(SidebarChannelMenu);
