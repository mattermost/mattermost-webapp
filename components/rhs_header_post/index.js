// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {
    showMentions,
    showSearchResults,
    showFlaggedPosts,
    showPinnedPosts,
    closeRightHandSide,
} from 'actions/views/rhs';

import RhsHeaderPost from './rhs_header_post.jsx';

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            showSearchResults,
            showMentions,
            showFlaggedPosts,
            showPinnedPosts,
            closeRightHandSide,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(RhsHeaderPost);
