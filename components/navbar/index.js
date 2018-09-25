// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {createSelector} from 'reselect';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {
    getCurrentChannel,
    isCurrentChannelReadOnly,
} from 'mattermost-redux/selectors/entities/channels';

import {leaveChannel} from 'actions/views/channel';
import {
    closeRightHandSide as closeRhs,
    showPinnedPosts,
    toggleMenu as toggleRhsMenu,
    closeMenu as closeRhsMenu,
} from 'actions/views/rhs';
import {toggle as toggleLhs, close as closeLhs} from 'actions/views/lhs';

import Navbar from './navbar.jsx';

const mapStateToProps = createSelector(
    getCurrentUser,
    getCurrentChannel,
    isCurrentChannelReadOnly,
    getConfig,
    (
        currentUser,
        channel,
        isReadOnly,
        config,
    ) => ({
        currentUser,
        channel,
        isReadOnly,
        enableWebrtc: config.EnableWebrtc === 'true',
    }),
);

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        showPinnedPosts,
        toggleLhs,
        closeLhs,
        closeRhs,
        toggleRhsMenu,
        closeRhsMenu,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
