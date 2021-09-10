// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ComponentProps} from 'react';
import {bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {
    showFlaggedPosts,
    showMentions,
    openRHSSearch,
    closeRightHandSide,
} from 'actions/views/rhs';

import {getIsRhsOpen, getRhsState} from 'selectors/rhs';
import {getBrowserWindowSize, getIsMobileView} from 'selectors/views/browser';
import {GlobalState} from 'types/store/index';

import RHSSearchNav from './rhs_search_nav';

type Props = ComponentProps<typeof RHSSearchNav>;

function mapStateToProps(state: GlobalState): Omit<Props, 'actions'> {
    const windowSize = getBrowserWindowSize(state);
    return {
        rhsState: getRhsState(state),
        rhsOpen: getIsRhsOpen(state),
        windowWidth: windowSize.width,
        isMobileView: getIsMobileView(state),
    };
}

const mapDispatchToProps = (dispatch: Dispatch<GenericAction>): Pick<Props, 'actions'> => ({
    actions: bindActionCreators({
        showFlaggedPosts,
        showMentions,
        openRHSSearch,
        closeRightHandSide,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(RHSSearchNav);
