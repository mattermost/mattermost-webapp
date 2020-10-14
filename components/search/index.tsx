// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {getMorePostsForSearch} from 'mattermost-redux/actions/search';
import {ActionFunc, DispatchFunc} from 'mattermost-redux/types/actions';
import {connect} from 'react-redux';
import {Action, AnyAction, bindActionCreators, Dispatch} from 'redux';

import {
    updateSearchTerms, showSearchResults, showMentions, showFlaggedPosts, closeRightHandSide, updateRhsState, setRhsExpanded,
} from 'actions/views/rhs';
import {autocompleteChannelsForSearch} from 'actions/channel_actions';
import {autocompleteUsersInTeam} from 'actions/user_actions';
import {getRhsState, getSearchTerms, getIsSearchingTerm, getIsRhsOpen, getIsRhsExpanded} from 'selectors/rhs';
import {RHSStates} from 'utils/constants';
import {GlobalState} from 'types/store';

import Search from './search';

type OwnProps = {
    isSideBarRight?: boolean,
    isSideBarRightOpen?: boolean,
    isFocus: boolean,
    channelDisplayName?: string,
    getFocus?: (searchBarFocus: () => void) => void,
    children?: React.ReactNode,
}

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

type StateProps = {
    isRhsExpanded:boolean,
    isRhsOpen:boolean,
    isSearchingTerm:boolean,
    searchTerms:string,
    searchVisible:boolean,
    isMentionSearch:boolean,
    isFlaggedPosts:boolean,
    isPinnedPosts:boolean,
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

type DispatchProps = {
    actions: {
        updateSearchTerms: (term: string) => Action,
        showSearchResults: (isMentionSearch: boolean) => Record<string, any>,
        showMentions: () => void,
        showFlaggedPosts: () => void,
        setRhsExpanded: (expanded: boolean) => Action,
        closeRightHandSide: () => void,
        autocompleteChannelsForSearch: (term: string, success?: () => void, error?: () => void) => void,
        autocompleteUsersInTeam: (username: string) => DispatchFunc,
        updateRhsState: (rhsState: string) => void,
        getMorePostsForSearch: () => ActionFunc,
    }
}

export type Props = StateProps & DispatchProps & OwnProps;

export default connect<StateProps, DispatchProps, OwnProps, GlobalState>(mapStateToProps, mapDispatchToProps)(Search);
