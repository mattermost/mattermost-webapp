// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {createSelector} from 'reselect';
import {
    getCurrentChannel,
    isCurrentChannelReadOnly,
} from 'mattermost-redux/selectors/entities/channels';

import {leaveChannel} from 'actions/views/channel';
import {
    closeRightHandSide as closeRhs,
    closeMenu as closeRhsMenu,
} from 'actions/views/rhs';
import {close as closeLhs} from 'actions/views/lhs';

import Navbar from './navbar.jsx';

const mapStateToProps = createSelector(
    getCurrentChannel,
    isCurrentChannelReadOnly,
    (
        channel,
        isReadOnly,
    ) => ({
        channel,
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

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
