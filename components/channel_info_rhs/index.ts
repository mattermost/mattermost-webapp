// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {AnyAction, bindActionCreators, Dispatch} from 'redux';

import {getCurrentChannel, isCurrentChannelFavorite, isCurrentChannelMuted} from 'mattermost-redux/selectors/entities/channels';
import {isModalOpen} from 'selectors/views/modals';

import {closeRightHandSide} from 'actions/views/rhs';

import {GlobalState} from 'types/store';

import {Constants, ModalIdentifiers} from 'utils/constants';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {unfavoriteChannel, favoriteChannel} from 'mattermost-redux/actions/channels';
import {muteChannel, unmuteChannel} from 'actions/channel_actions';
import {openModal} from 'actions/views/modals';
import {getUserIdFromChannelId} from 'utils/utils';
import {getProfilesInCurrentChannel, getStatusForUserId, getUser} from 'mattermost-redux/selectors/entities/users';
import {isGuest} from 'mattermost-redux/utils/user_utils';

import RHS, {ChannelInfoRhsProps} from './rhs';

function mapStateToProps(state: GlobalState) {
    const channel = getCurrentChannel(state);
    const currentUserId = getCurrentUserId(state);
    const currentTeam = getCurrentTeam(state);

    const isFavorite = isCurrentChannelFavorite(state);
    const isMuted = isCurrentChannelMuted(state);
    const isInvitingPeople = isModalOpen(state, ModalIdentifiers.CHANNEL_INVITE);

    const gmUsers = getProfilesInCurrentChannel(state);

    const props = {
        channel,
        currentUserId,
        currentTeam,
        isFavorite,
        isMuted,
        isInvitingPeople,
        gmUsers,
    } as ChannelInfoRhsProps;

    switch (channel.type) {
    case Constants.DM_CHANNEL:
        // eslint-disable-next-line no-case-declarations
        const user = getUser(state, getUserIdFromChannelId(channel.name, currentUserId));
        props.dmUser = {
            user,
            is_guest: isGuest(user.roles),
            status: getStatusForUserId(state, user.id),
        };
        break;
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
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(RHS);
