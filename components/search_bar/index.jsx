// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {
    updateSearchTerms,
    showSearchResults,
    showMentions,
    showFlaggedPosts,
    closeRightHandSide,
} from 'actions/views/rhs';
import {getRhsState, getSearchTerms, getIsSearchingTerm} from 'selectors/rhs';
import {RHSStates} from 'utils/constants.jsx';

import SearchBar from './search_bar.jsx';

function mapStateToProps(state) {
    const rhsState = getRhsState(state);

    return {
        isSearchingTerm: getIsSearchingTerm(state),
        searchTerms: getSearchTerms(state),
        isMentionSearch: rhsState === RHSStates.MENTION,
        isFlaggedPosts: rhsState === RHSStates.FLAG,
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
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchBar);
