// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {withRouter, RouteComponentProps, matchPath} from 'react-router-dom';

import {memo} from 'react';

import {getCurrentChannel, getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {setRhsExpanded, showChannelInfo, showPinnedPosts, showChannelFiles, openRHSSearch, closeRightHandSide, openAtPrevious, updateSearchTerms} from 'actions/views/rhs';
import {
    getIsRhsExpanded,
    getIsRhsOpen,
    getRhsState,
    getSelectedChannel,
    getSelectedPostId,
    getSelectedPostCardId,
    getPreviousRhsState,
    getSelectedChannelId,
} from 'selectors/rhs';
import {RHSStates} from 'utils/constants';

import {GlobalState} from 'types/store';

import {selectCurrentProductId} from 'selectors/products';

import SidebarRight from './sidebar_right';

function mapStateToProps(state: GlobalState, props: RouteComponentProps) {
    const rhsState = getRhsState(state);
    const channel = getCurrentChannel(state);
    const team = getCurrentTeam(state);
    const teamId = team?.id ?? '';
    const productId = selectCurrentProductId(state, props.location.pathname);

    const selectedPostId = getSelectedPostId(state);
    const selectedPostCardId = getSelectedPostCardId(state);

    const rhsChannel = getSelectedChannel(state);
    const isRHSLoading = Boolean(
        !team ||
        (getSelectedChannelId(state) && !rhsChannel) ||
        (getCurrentChannelId(state) && matchPath(props.location.pathname, {path: '/:team/:path(channels|messages)/:identifier/:postid?'}) && !channel),
    );

    return {
        isExpanded: getIsRhsExpanded(state),
        isOpen: getIsRhsOpen(state),
        channel,
        postRightVisible: Boolean(selectedPostId),
        postCardVisible: Boolean(selectedPostCardId),
        searchVisible: Boolean(rhsState) && rhsState !== RHSStates.PLUGIN,
        previousRhsState: getPreviousRhsState(state),
        isPinnedPosts: rhsState === RHSStates.PIN,
        isChannelFiles: rhsState === RHSStates.CHANNEL_FILES,
        isChannelInfo: rhsState === RHSStates.CHANNEL_INFO,
        isChannelMembers: rhsState === RHSStates.CHANNEL_MEMBERS,
        isPluginView: rhsState === RHSStates.PLUGIN,
        rhsChannel,
        isRHSLoading,
        selectedPostId,
        selectedPostCardId,
        team,
        teamId,
        productId,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            setRhsExpanded,
            showPinnedPosts,
            openRHSSearch,
            closeRightHandSide,
            openAtPrevious,
            updateSearchTerms,
            showChannelFiles,
            showChannelInfo,
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(memo(SidebarRight)));
