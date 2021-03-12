// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getMorePostsForSearch, getMoreFilesForSearch} from 'mattermost-redux/actions/search';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {connect} from 'react-redux';
import {AnyAction, bindActionCreators, Dispatch} from 'redux';

import {
    updateSearchTerms,
    updateInitialSearchType,
    showSearchResults,
    showChannelFiles,
    showMentions,
    showFlaggedPosts,
    closeRightHandSide,
    updateRhsState,
    setRhsExpanded,
    filterFilesSearchByExt,
    updateSearchType,
} from 'actions/views/rhs';
import {autocompleteChannelsForSearch} from 'actions/channel_actions';
import {autocompleteUsersInTeam} from 'actions/user_actions';
import {getRhsState, getSearchTerms, getSearchType, getIsSearchingTerm, getIsRhsOpen, getIsRhsExpanded} from 'selectors/rhs';
import {RHSStates} from 'utils/constants';
import {GlobalState} from 'types/store';

import Search from './search';
import type {StateProps, DispatchProps, OwnProps} from './types';

function mapStateToProps(state: GlobalState) {
    const rhsState = getRhsState(state);
    const config = getConfig(state);
    const filesSearchEnabled = (config as any).FeatureFlagFilesSearch === 'true';

    return {
        isRhsExpanded: getIsRhsExpanded(state),
        isRhsOpen: getIsRhsOpen(state),
        isSearchingTerm: getIsSearchingTerm(state),
        searchTerms: getSearchTerms(state),
        searchType: getSearchType(state),
        searchVisible: Boolean(rhsState) && rhsState !== RHSStates.PLUGIN,
        isMentionSearch: rhsState === RHSStates.MENTION,
        isFlaggedPosts: rhsState === RHSStates.FLAG,
        isPinnedPosts: rhsState === RHSStates.PIN,
        isChannelFiles: rhsState === RHSStates.CHANNEL_FILES,
        filesSearchEnabled,
    };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
    return {
        actions: bindActionCreators({
            updateSearchTerms,
            updateSearchType,
            updateInitialSearchType,
            showSearchResults,
            showChannelFiles,
            showMentions,
            showFlaggedPosts,
            setRhsExpanded,
            closeRightHandSide,
            autocompleteChannelsForSearch,
            autocompleteUsersInTeam,
            updateRhsState,
            getMorePostsForSearch,
            getMoreFilesForSearch,
            filterFilesSearchByExt,
        }, dispatch),
    };
}

export default connect<StateProps, DispatchProps, OwnProps, GlobalState>(mapStateToProps, mapDispatchToProps)(Search);
