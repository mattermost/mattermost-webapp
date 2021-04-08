// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {JobType, Job, JobsByType} from 'mattermost-redux/types/jobs';
import {GlobalState} from 'mattermost-redux/types/store';
import {IDMappedObjects} from 'mattermost-redux/types/utilities';

export function getAllJobs(state: GlobalState): IDMappedObjects<Job> {
    return state.entities.jobs.jobs;
}

export function getJobsByType(state: GlobalState): JobsByType {
    return state.entities.jobs.jobsByTypeList;
}

export function makeGetJobsByType(type: JobType): (state: GlobalState) => Job[] {
    return createSelector(
        getJobsByType,
        (jobsByType) => {
            return jobsByType[type] || [];
        },
    );
}
