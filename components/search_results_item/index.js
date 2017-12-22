// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {closeRightHandSide} from 'actions/views/rhs';

import SelectResultsItem from './search_results_item.jsx';

function mapStateToProps(state) {
    return {
        currentTeamName: getCurrentTeam(state).name
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            closeRightHandSide
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectResultsItem);
