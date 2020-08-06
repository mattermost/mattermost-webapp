// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';

import {GlobalState} from 'types/store';

import {
    setRhsExpanded,
    showMentions,
    showSearchResults,
    showFlaggedPosts,
    showPinnedPosts,
    closeRightHandSide,
    toggleRhsExpanded,
} from 'actions/views/rhs';
import {getIsRhsExpanded} from 'selectors/rhs';

import RhsHeaderPost from './rhs_header_post';

function mapStateToProps(state: GlobalState) {
    return {
        isExpanded: getIsRhsExpanded(state),
        relativeTeamUrl: getCurrentRelativeTeamUrl(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            setRhsExpanded,
            showSearchResults,
            showMentions,
            showFlaggedPosts,
            showPinnedPosts,
            closeRightHandSide,
            toggleRhsExpanded,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(RhsHeaderPost);
