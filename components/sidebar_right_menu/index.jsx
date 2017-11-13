// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {getRhsState} from 'selectors/rhs';

import {RHSStates} from 'utils/constants.jsx';

import SidebarRightMenu from './sidebar_right_menu.jsx';

function mapStateToProps(state) {
    const rhsState = getRhsState(state);

    return {
        isMentionSearch: rhsState === RHSStates.MENTION
    };
}

export default connect(mapStateToProps)(SidebarRightMenu);
