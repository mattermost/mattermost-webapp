// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getJobsByType, createJob, cancelJob} from 'mattermost-redux/actions/jobs';
import {getConfig} from 'mattermost-redux/selectors/entities/admin';
import * as Selectors from 'mattermost-redux/selectors/entities/jobs';
import {GenericAction} from 'mattermost-redux/types/actions';
import {GlobalState} from 'mattermost-redux/types/store';

import Table, {Props} from './table';

function mapStateToProps(state: GlobalState, ownProps: Props) {
    return {
        jobs: Selectors.makeGetJobsByType(ownProps.jobType)(state),
        downloadExportResults: getConfig(state).MessageExportSettings!.DownloadExportResults,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            getJobsByType,
            createJob,
            cancelJob,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Table);
