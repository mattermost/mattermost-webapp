// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';

import {
    setRhsExpanded,
    showMentions,
    showSearchResults,
    showFlaggedPosts,
    showPinnedPosts,
    closeRightHandSide,
    toggleRhsExpanded,
} from 'actions/views/rhs';

import RhsHeaderPost from './rhs_header_post.jsx';

function mapStateToProps(state) {
    return {
        relativeTeamUrl: getCurrentRelativeTeamUrl(state),
    };
}

function mapDispatchToProps(dispatch) {
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
