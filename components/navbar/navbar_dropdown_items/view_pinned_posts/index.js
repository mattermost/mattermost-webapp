// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';

import {closeRightHandSide, showPinnedPosts} from 'actions/views/rhs';
import {getRhsState} from 'selectors/rhs';
import {RHSStates} from 'utils/constants';

import ViewPinnedPostsOption from './view_pinned_posts';

const mapStateToProps = createSelector(
    getRhsState,
    (rhsState) => ({
        hasPinnedPosts: rhsState === RHSStates.PIN,
    }),
);

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        closeRightHandSide,
        showPinnedPosts,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ViewPinnedPostsOption);
