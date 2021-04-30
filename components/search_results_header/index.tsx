// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {AnyAction, bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'types/store/index.js';

import {
    closeRightHandSide,
    toggleRhsExpanded,
} from 'actions/views/rhs';
import {getIsRhsExpanded} from 'selectors/rhs';

import SearchResultsHeader from './search_results_header';

function mapStateToProps(state: GlobalState) {
    return {
        isExpanded: getIsRhsExpanded(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
    return {
        actions: bindActionCreators({
            closeRightHandSide,
            toggleRhsExpanded,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchResultsHeader);
