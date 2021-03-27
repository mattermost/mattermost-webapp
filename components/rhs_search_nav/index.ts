// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ComponentProps} from 'react';
import {bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {
    openModal,
    closeModal,
} from 'actions/views/modals';

import {
    showFlaggedPosts,
    showMentions,
    openRHSSearch,
    closeRightHandSide,
} from 'actions/views/rhs';

import {getIsRhsOpen, getRhsState} from 'selectors/rhs';
import {isModalOpen} from 'selectors/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import {GlobalState} from 'types/store/index';

import RHSSearchNav from './rhs_search_nav';

type Props = ComponentProps<typeof RHSSearchNav>;

function mapStateToProps(state: GlobalState): Omit<Props, 'actions'> {
    return {
        rhsState: getRhsState(state),
        rhsOpen: getIsRhsOpen(state),
        isQuickSwitcherOpen: isModalOpen(state, ModalIdentifiers.QUICK_SWITCH),
    };
}

const mapDispatchToProps = (dispatch: Dispatch<GenericAction>): Pick<Props, 'actions'> => ({
    actions: bindActionCreators({
        showFlaggedPosts,
        showMentions,
        openRHSSearch,
        closeRightHandSide,
        openModal,
        closeModal,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(RHSSearchNav);
