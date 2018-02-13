// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {closeRightHandSide, updateRhsState, showPinnedPosts} from 'actions/views/rhs';
import {getRhsState} from 'selectors/rhs';
import {RHSStates} from 'utils/constants.jsx';

import Navbar from './navbar.jsx';

const mapStateToProps = (state) => {
    const rhsState = getRhsState(state);

    return {
        isPinnedPosts: rhsState === RHSStates.PIN
    };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        closeRightHandSide,
        updateRhsState,
        showPinnedPosts
    }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
