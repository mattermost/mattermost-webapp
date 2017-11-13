// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {getRhsState} from 'selectors/rhs';

import {RHSStates} from 'utils/constants.jsx';

import Navbar from './navbar.jsx';

function mapStateToProps(state) {
    const rhsState = getRhsState(state);

    return {
        isPinnedPosts: rhsState === RHSStates.PIN
    };
}

export default connect(mapStateToProps)(Navbar);
