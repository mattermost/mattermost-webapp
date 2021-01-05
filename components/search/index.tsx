// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getMorePostsForSearch} from 'mattermost-redux/actions/search';
import {connect} from 'react-redux';
import {AnyAction, bindActionCreators, Dispatch} from 'redux';

import {
    updateSearchTerms, showSearchResults, showMentions, showFlaggedPosts, closeRightHandSide, updateRhsState, setRhsExpanded,
} from 'actions/views/rhs';
import {autocompleteChannelsForSearch} from 'actions/channel_actions';
import {autocompleteUsersInTeam} from 'actions/user_actions';
import {getRhsState, getSearchTerms, getIsSearchingTerm, getIsRhsOpen, getIsRhsExpanded} from 'selectors/rhs';
import {RHSStates} from 'utils/constants';
import {GlobalState} from 'types/store';

import Search from './search';
import type {StateProps, DispatchProps, OwnProps} from './types';

function mapStateToProps(state: GlobalState) {
    const rhsState = getRhsState(state);

    return {
        isRhsExpanded: getIsRhsExpanded(state),
        isRhsOpen: getIsRhsOpen(state),
        isSearchingTerm: getIsSearchingTerm(state),
        searchTerms: getSearchTerms(state),
        searchVisible: Boolean(rhsState) && rhsState !== RHSStates.PLUGIN,
        isMentionSearch: rhsState === RHSStates.MENTION,
        isFlaggedPosts: rhsState === RHSStates.FLAG,
        isPinnedPosts: rhsState === RHSStates.PIN,
    };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
    return {
        actions: bindActionCreators({
            updateSearchTerms,
            showSearchResults,
            showMentions,
            showFlaggedPosts,
            setRhsExpanded,
            closeRightHandSide,
            autocompleteChannelsForSearch,
            autocompleteUsersInTeam,
            updateRhsState,
            getMorePostsForSearch,
        }, dispatch),
    };
}

export default connect<StateProps, DispatchProps, OwnProps, GlobalState>(mapStateToProps, mapDispatchToProps)(Search);
