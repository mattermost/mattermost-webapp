// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable @typescript-eslint/naming-convention */

import {connect} from 'react-redux';

import {getDataRetentionCustomPolicies as fetchDataRetentionCustomPolicies} from 'mattermost-redux/actions/admin';
import {getDataRetentionCustomPolicies, getDataRetentionCustomPoliciesCount} from 'mattermost-redux/selectors/entities/admin';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';
import {DataRetentionCustomPolicies} from 'mattermost-redux/types/data_retention';
import {createJob, getJobsByType} from 'mattermost-redux/actions/jobs';

import {GlobalState} from 'types/store';

import DataRetentionSettings from './data_retention_settings';
import { Job, JobType } from 'mattermost-redux/types/jobs';

type Actions = {
    getDataRetentionCustomPolicies: () => Promise<{ data: DataRetentionCustomPolicies}>;
    createJob: (job: Job) => Promise<{ data: any}>
    getJobsByType: (job: JobType) => Promise<{ data: any}>
};

function mapStateToProps(state: GlobalState) {
    const customPolicies = getDataRetentionCustomPolicies(state);
    const customPoliciesCount = getDataRetentionCustomPoliciesCount(state);

    return {
        customPolicies,
        customPoliciesCount
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getDataRetentionCustomPolicies: fetchDataRetentionCustomPolicies,
            createJob,
            getJobsByType,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataRetentionSettings);
