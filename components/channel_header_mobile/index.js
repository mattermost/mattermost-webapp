// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {createSelector} from 'reselect';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {
    getCurrentChannel,
    getMyCurrentChannelMembership,
    isCurrentChannelReadOnly,
} from 'mattermost-redux/selectors/entities/channels';
import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';

import {leaveChannel} from 'actions/views/channel';
import {
    closeRightHandSide as closeRhs,
    closeMenu as closeRhsMenu,
} from 'actions/views/rhs';
import {close as closeLhs} from 'actions/views/lhs';

import ChannelHeaderMobile from './channel_header_mobile';

const isCurrentChannelMuted = createSelector(
    getMyCurrentChannelMembership,
    (membership) => isChannelMuted(membership),
);

const mapStateToProps = createSelector(
    getCurrentUser,
    getCurrentChannel,
    isCurrentChannelMuted,
    isCurrentChannelReadOnly,
    (
        user,
        channel,
        isMuted,
        isReadOnly,
    ) => ({
        user,
        channel,
        isMuted,
        isReadOnly,
    }),
);

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        closeLhs,
        closeRhs,
        closeRhsMenu,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChannelHeaderMobile);
