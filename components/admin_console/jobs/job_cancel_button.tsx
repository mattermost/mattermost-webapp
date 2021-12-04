// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';

import {useIntl} from 'react-intl';

import {Job} from 'mattermost-redux/types/jobs';

import {JobStatuses} from 'utils/constants';

type Props = {
    job: Job;
    disabled: boolean;
    onClick: (id: string) => void;
}

const JobCancelButton = React.memo(({job, disabled, onClick}: Props) => {
    const intl = useIntl();
    let cancelButton = null;

    const handleClick = useCallback((e) => {
        e.preventDefault();
        onClick(job.id);
    }, [onClick, job.id])

    if (!disabled && (job.status === JobStatuses.PENDING || job.status === JobStatuses.IN_PROGRESS)) {
        cancelButton = (
            <span
                data-job-id={job.id}
                onClick={handleClick}
                className='job-table__cancel-button'
                title={intl.formatMessage({id: 'admin.jobTable.cancelButton', defaultMessage: 'Cancel'})}
            >
                {'×'}
            </span>
        );
    }

    return cancelButton;
});

export default JobCancelButton
