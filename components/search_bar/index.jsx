// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';

import {
    updateSearchTerms,
    showSearchResults,
    showMentions,
    showFlaggedPosts,
    closeRightHandSide,
    updateRhsState,
} from 'actions/views/rhs';
import {autocompleteChannelsForSearch} from 'actions/channel_actions';
import {autocompleteUsersInTeam} from 'actions/user_actions';
import {getRhsState, getSearchTerms, getIsSearchingTerm, getIsRhsOpen} from 'selectors/rhs';
import {RHSStates} from 'utils/constants';

import SearchBar from './search_bar.jsx';

function mapStateToProps(state) {
    const rhsState = getRhsState(state);
    const currentChannelId = getCurrentChannel(state).name;
    return {
        isSearchingTerm: getIsSearchingTerm(state),
        searchTerms: getSearchTerms(state),
        isMentionSearch: rhsState === RHSStates.MENTION,
        isFlaggedPosts: rhsState === RHSStates.FLAG,
        isRhsOpen: getIsRhsOpen(state),
        currentChannelId,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            updateSearchTerms,
            showSearchResults,
            showMentions,
            showFlaggedPosts,
            closeRightHandSide,
            autocompleteChannelsForSearch,
            autocompleteUsersInTeam,
            updateRhsState,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchBar);
