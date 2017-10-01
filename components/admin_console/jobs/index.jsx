// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getJobsByType} from 'mattermost-redux/actions/jobs';
import * as Selectors from 'mattermost-redux/selectors/entities/jobs';

import Table from './table.jsx';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
        jobs: Selectors.makeGetJobsByType(ownProps.jobType)(state)
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getJobsByType
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Table);
