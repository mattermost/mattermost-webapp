// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';

import {GenericAction} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store/index';

import {setRhsExpanded, showPinnedPosts, openRHSSearch, closeRightHandSide, openAtPrevious, updateSearchTerms} from 'actions/views/rhs';
import {
    getIsRhsExpanded,
    getIsRhsOpen,
    getRhsState,
    getSelectedChannel,
    getSelectedPostId,
    getSelectedPostCardId,
    getPreviousRhsState,
} from 'selectors/rhs';
import {RHSStates} from 'utils/constants';

import SidebarRight from './sidebar_right';

function mapStateToProps(state: GlobalState) {
    const rhsState = getRhsState(state);
    const channel = getCurrentChannel(state);

    const selectedPostId = getSelectedPostId(state);
    const selectedPostCardId = getSelectedPostCardId(state);

    return {
        isExpanded: getIsRhsExpanded(state),
        isOpen: getIsRhsOpen(state),
        channel,
        currentUserId: getCurrentUserId(state),
        postRightVisible: Boolean(selectedPostId),
        postCardVisible: Boolean(selectedPostCardId),
        searchVisible: Boolean(rhsState) && rhsState !== RHSStates.PLUGIN,
        previousRhsState: getPreviousRhsState(state),
        isMentionSearch: rhsState === RHSStates.MENTION,
        isFlaggedPosts: rhsState === RHSStates.FLAG,
        isPinnedPosts: rhsState === RHSStates.PIN,
        isPluginView: rhsState === RHSStates.PLUGIN,
        rhsChannel: getSelectedChannel(state),
        selectedPostId,
        selectedPostCardId,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            setRhsExpanded,
            showPinnedPosts,
            openRHSSearch,
            closeRightHandSide,
            openAtPrevious,
            updateSearchTerms,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarRight as unknown as React.ComponentClass);
