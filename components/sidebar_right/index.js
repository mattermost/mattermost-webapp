// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {showMentions, showFlaggedPosts, closeRightHandSide} from 'actions/views/rhs';

import {getRhsState, getSelectedPostId} from 'selectors/rhs';

import {RHSStates} from 'utils/constants.jsx';

import SidebarRight from './sidebar_right.jsx';

function mapStateToProps(state) {
    const rhsState = getRhsState(state);

    return {
        currentUser: getCurrentUser(state),
        postRightVisible: Boolean(getSelectedPostId(state)),
        searchVisible: Boolean(rhsState),
        fromSearch: state.views.rhs.fromSearch,
        fromFlaggedPosts: state.views.rhs.fromFlaggedPosts,
        fromPinnedPosts: state.views.rhs.fromPinnedPosts,
        isMentionSearch: rhsState === RHSStates.MENTION,
        isFlaggedPosts: rhsState === RHSStates.FLAG,
        isPinnedPosts: rhsState === RHSStates.PIN
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            showMentions,
            showFlaggedPosts,
            closeRightHandSide
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarRight);
