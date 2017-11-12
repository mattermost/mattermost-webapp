// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {getRhsState} from 'selectors/rhs';

import {RHSStates} from 'utils/constants.jsx';

import SidebarRight from './sidebar_right.jsx';

function mapStateToProps(state) {
    const rhsState = getRhsState(state);

    return {
        postRightVisible: Boolean(state.views.rhs.selectedPostId),
        searchVisible: Boolean(rhsState),
        fromSearch: state.views.rhs.fromSearch,
        fromFlaggedPosts: state.views.rhs.fromFlaggedPosts,
        fromPinnedPosts: state.views.rhs.fromPinnedPosts,
        isMentionSearch: rhsState === RHSStates.MENTION,
        isFlaggedPosts: rhsState === RHSStates.FLAG,
        isPinnedPosts: rhsState === RHSStates.PIN
    };
}

export default connect(mapStateToProps)(SidebarRight);
