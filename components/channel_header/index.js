// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {
    favoriteChannel,
    unfavoriteChannel,
    updateChannelNotifyProps,
} from 'mattermost-redux/actions/channels';
import {getCustomEmojisInText} from 'mattermost-redux/actions/emojis';
import {General} from 'mattermost-redux/constants';
import {
    getCurrentChannel,
    getMyCurrentChannelMembership,
    isCurrentChannelFavorite,
    isCurrentChannelMuted,
    isCurrentChannelReadOnly,
} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {
    getCurrentUser,
    getUser,
} from 'mattermost-redux/selectors/entities/users';
import {getUserIdFromChannelName} from 'mattermost-redux/utils/channel_utils';

import {loadBot} from 'mattermost-redux/actions/bots';

import {getBotAccounts} from 'mattermost-redux/selectors/entities/bots';

import {goToLastViewedChannel} from 'actions/views/channel';
import {openModal, closeModal} from 'actions/views/modals';
import {
    showFlaggedPosts,
    showPinnedPosts,
    showMentions,
    closeRightHandSide,
    updateRhsState,
} from 'actions/views/rhs';
import {getRhsState} from 'selectors/rhs';
import {isModalOpen} from 'selectors/views/modals';
import {ModalIdentifiers} from 'utils/constants';

import ChannelHeader from './channel_header';

const mapStateToProps = (state) => {
    const channel = getCurrentChannel(state) || {};
    const user = getCurrentUser(state);

    let dmUser;
    let dmBot;
    if (channel && channel.type === General.DM_CHANNEL) {
        const dmUserId = getUserIdFromChannelName(user.id, channel.name);
        dmUser = getUser(state, dmUserId);
        dmBot = getBotAccounts(state)[dmUserId];
    }

    return {
        teamId: getCurrentTeamId(state),
        channel,
        channelMember: getMyCurrentChannelMembership(state),
        currentUser: user,
        dmUser,
        dmBot,
        rhsState: getRhsState(state),
        isFavorite: isCurrentChannelFavorite(state),
        isReadOnly: isCurrentChannelReadOnly(state),
        isMuted: isCurrentChannelMuted(state),
        isQuickSwitcherOpen: isModalOpen(state, ModalIdentifiers.QUICK_SWITCH),
    };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        favoriteChannel,
        unfavoriteChannel,
        showFlaggedPosts,
        showPinnedPosts,
        showMentions,
        closeRightHandSide,
        updateRhsState,
        getCustomEmojisInText,
        updateChannelNotifyProps,
        goToLastViewedChannel,
        openModal,
        closeModal,
        loadBot,
    }, dispatch),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChannelHeader));
