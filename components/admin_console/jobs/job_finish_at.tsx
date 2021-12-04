// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedTime, FormattedDate} from 'react-intl';

import {Job} from 'mattermost-redux/types/jobs';

import {JobStatuses} from 'utils/constants';

const JobFinishAt = React.memo(({status, millis}: {status: Job['status'], millis: number}): JSX.Element => {
    if (millis === 0 || status === JobStatuses.PENDING || status === JobStatuses.IN_PROGRESS || status === JobStatuses.CANCEL_REQUESTED) {
        return (
            <span className='whitespace--nowrap'>{'--'}</span>
        );
    }

    const date = new Date(millis);

    return (
        <span className='whitespace--nowrap'>
            <FormattedDate
                value={date}
                day='2-digit'
                month='short'
                year='numeric'
            />
            {' - '}
            <FormattedTime
                value={date}
                hour='2-digit'
                minute='2-digit'
            />
        </span>
    );
});

export default JobFinishAt;
