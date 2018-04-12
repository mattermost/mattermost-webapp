// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {isCurrentChannelReadOnly} from 'mattermost-redux/selectors/entities/channels';

import {
    closeRightHandSide as closeRhs,
    updateRhsState,
    showPinnedPosts,
    toggleMenu as toggleRhsMenu,
    closeMenu as closeRhsMenu,
} from 'actions/views/rhs';
import {toggle as toggleLhs, close as closeLhs} from 'actions/views/lhs';
import {getRhsState} from 'selectors/rhs';
import {RHSStates} from 'utils/constants.jsx';

import Navbar from './navbar.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const enableWebrtc = config.EnableWebrtc === 'true';

    const rhsState = getRhsState(state);

    return {
        isPinnedPosts: rhsState === RHSStates.PIN,
        enableWebrtc,
        isReadOnly: isCurrentChannelReadOnly(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            updateRhsState,
            showPinnedPosts,
            toggleLhs,
            closeLhs,
            closeRhs,
            toggleRhsMenu,
            closeRhsMenu,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
