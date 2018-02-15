// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {closeRightHandSide, updateRhsState, showPinnedPosts} from 'actions/views/rhs';
import {getRhsState} from 'selectors/rhs';
import {RHSStates} from 'utils/constants.jsx';

import Navbar from './navbar.jsx';

function mapStateToProps(state) {
    const config = state.entities.general.config;
    const enableWebrtc = config.EnableWebrtc === 'true';

    const rhsState = getRhsState(state);

    return {
        isPinnedPosts: rhsState === RHSStates.PIN,
        enableWebrtc
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            closeRightHandSide,
            updateRhsState,
            showPinnedPosts
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
