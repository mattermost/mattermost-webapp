// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import JobTable from './table.jsx';

describe('components/admin_console/jobs/table', () => {
    const createJobButtonText = (
        <FormattedMessage
            id='admin.complianceExport.createJob.title'
            defaultMessage='Run Compliance Export Job Now'
        />
    );

    const createJobHelpText = (
        <FormattedMessage
            id='admin.complianceExport.createJob.help'
            defaultMessage='Initiates a Compliance Export job immediately.'
        />
    );
    const cancelJob = jest.fn(() => Promise.resolve({}));
    const createJob = jest.fn(() => Promise.resolve({}));
    const getJobsByType = jest.fn(() => Promise.resolve({}));

    const baseProps = {
        config: {},
        createJobButtonText,
        createJobHelpText,
        disabled: false,
        actions: {
            cancelJob,
            createJob,
            getJobsByType,
        },
        jobType: 'data_retention',
        jobs: [{
            created_at: 1540834294674,
            last_activity_at: 1540834294674,
            id: '1231',
            status: 'success',
            type: 'data_retention',
        }, {
            created_at: 1540834294674,
            last_activity_at: 1540834294674,
            id: '1232',
            status: 'pending',
            type: 'data_retention',
        }, {
            created_at: 1540834294674,
            last_activity_at: 1540834294674,
            id: '1233',
            status: 'in_progress',
            type: 'data_retention',
        }, {
            created_at: 1540834294674,
            last_activity_at: 1540834294674,
            id: '1234',
            status: 'cancel_requested',
            type: 'data_retention',
        }, {
            created_at: 1540834294674,
            last_activity_at: 1540834294674,
            id: '1235',
            status: 'canceled',
            type: 'data_retention',
        }, {
            created_at: 1540834294674,
            last_activity_at: 1540834294674,
            id: '1236',
            status: 'error',
            type: 'data_retention',
        }],
    };

    test('should call create job func', () => {
        const wrapper = shallowWithIntl(
            <JobTable {...baseProps}/>
        );

        wrapper.find('.job-table__create-button > div > .btn-default').simulate('click', {preventDefault: jest.fn()});
        expect(createJob).toHaveBeenCalledTimes(1);
    });

    test('should call cancel job func', () => {
        const wrapper = shallowWithIntl(
            <JobTable {...baseProps}/>
        );

        wrapper.find('.job-table__cancel-button').first().simulate('click', {preventDefault: jest.fn(), currentTarget: {getAttribute: () => '1234'}});
        expect(cancelJob).toHaveBeenCalledTimes(1);
    });
});
