// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {closeRightHandSide, showPinnedPosts} from 'actions/views/rhs';
import {getRhsState} from 'selectors/rhs';
import {RHSStates} from 'utils/constants';

import ViewPinnedPosts from './view_pinned_posts';

const mapStateToProps = (state) => ({
    hasPinnedPosts: getRhsState(state) === RHSStates.PIN,
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        closeRightHandSide,
        showPinnedPosts,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ViewPinnedPosts);
