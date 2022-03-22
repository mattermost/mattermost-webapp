// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {AnyAction, bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'types/store/index.js';

import {
    closeRightHandSide,
    toggleRhsExpanded,
    showChannelInfo,
} from 'actions/views/rhs';
import {getIsRhsExpanded, getPreviousRhsState} from 'selectors/rhs';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';

import SearchResultsHeader from './search_results_header';

function mapStateToProps(state: GlobalState) {
    return {
        isExpanded: getIsRhsExpanded(state),
        channelId: getCurrentChannelId(state),
        previousRhsState: getPreviousRhsState(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
    return {
        actions: bindActionCreators({
            closeRightHandSide,
            toggleRhsExpanded,
            showChannelInfo,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchResultsHeader);
