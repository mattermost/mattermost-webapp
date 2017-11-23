// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {closeRightHandSide} from 'actions/views/rhs';

import {getRhsState} from 'selectors/rhs';

import {RHSStates} from 'utils/constants.jsx';

import Navbar from './navbar.jsx';

function mapStateToProps(state) {
    const rhsState = getRhsState(state);

    return {
        isPinnedPosts: rhsState === RHSStates.PIN
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            closeRightHandSide
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
