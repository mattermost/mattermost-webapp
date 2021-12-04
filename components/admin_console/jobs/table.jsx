// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import {FormattedMessage} from 'react-intl';

import {JobTypes} from 'utils/constants';

import DownloadLink from './download_link';
import JobStatus from './job_status';
import JobRunLength from './job_run_length';
import JobCancelButton from './job_cancel_button';
import JobFinishAt from './job_finish_at';

import './table.scss';

class JobTable extends React.PureComponent {
    static propTypes = {

        /**
         * Array of jobs
         */
        jobs: PropTypes.arrayOf(PropTypes.object).isRequired,

        /**
         * Function called when displaying extra text.
         */
        getExtraInfoText: PropTypes.func,

        /**
         * Grey buttons out when disabled
         */
        disabled: PropTypes.bool,

        /**
         * Help text under the create job button
         */
        createJobHelpText: PropTypes.element.isRequired,

        /**
         * Button text to create a new job
         */
        createJobButtonText: PropTypes.element.isRequired,

        /**
         * The type of jobs to include in this table.
         */
        jobType: PropTypes.string.isRequired,

        /**
         * A variable set in config.json to determine if results can be downloaded or not.
         * Note that there is NO front-end associated with this setting due to security.
         * Only the person with access to the config.json file can enable this option.
         */
        downloadExportResults: PropTypes.bool,

        actions: PropTypes.shape({
            getJobsByType: PropTypes.func.isRequired,
            cancelJob: PropTypes.func.isRequired,
            createJob: PropTypes.func.isRequired,
        }).isRequired,

        /**
         * Allows for custom styles on the job table component
         */
        className: PropTypes.string,

        /**
         * Hide the job creation button. This is useful if you want to place the button elsewhere on your page or hide it.
         */
        hideJobCreateButton: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.interval = null;
    }

    componentDidMount() {
        this.props.actions.getJobsByType(this.props.jobType);
        this.interval = setInterval(this.reload, 15000);
    }

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    getExtraInfoText = (job) => {
        if (job.data && job.data.error && job.data.error.length > 0) {
            return <span title={job.data.error}>{job.data.error}</span>;
        }

        if (this.props.getExtraInfoText) {
            return this.props.getExtraInfoText(job);
        }

        return <span/>;
    }

    reload = () => {
        this.props.actions.getJobsByType(this.props.jobType);
    };

    handleCancelJob = async (jobId) => {
        await this.props.actions.cancelJob(jobId);
        this.reload();
    };

    handleCreateJob = async (e) => {
        e.preventDefault();
        const job = {
            type: this.props.jobType,
        };

        await this.props.actions.createJob(job);
        this.reload();
    };

    render() {
        const showFilesColumn = this.props.jobType === JobTypes.MESSAGE_EXPORT && this.props.downloadExportResults;
        var items = this.props.jobs.map((job) => {
            return (
                <tr key={job.id}>
                    <td
                        width='30px'
                        className='whitespace--nowrap text-center'
                    >
                        <JobCancelButton
                            job={job}
                            onClick={this.handleCancelJob}
                            disabled={this.props.disabled}
                        />
                    </td>
                    <td className='whitespace--nowrap'><JobStatus job={job}/></td>
                    {showFilesColumn &&
                        <td className='whitespace--nowrap'><DownloadLink job={job}/></td>
                    }
                    <td className='whitespace--nowrap'>
                        <JobFinishAt
                            status={job.status}
                            millis={job.last_activity_at}
                        />
                    </td>
                    <td className='whitespace--nowrap'><JobRunLength job={job}/></td>
                    <td>{this.getExtraInfoText(job)}</td>
                </tr>
            );
        });

        return (
            <div className={classNames('job-table__panel', this.props.className)}>
                <div className='job-table__create-button'>
                    {
                        !this.props.hideJobCreateButton &&
                        <div>
                            <button
                                type='button'
                                className='btn btn-default'
                                onClick={this.handleCreateJob}
                                disabled={this.props.disabled}
                            >
                                {this.props.createJobButtonText}
                            </button>
                        </div>
                    }
                    <div className='help-text'>
                        {this.props.createJobHelpText}
                    </div>
                </div>
                <div className='job-table__table'>
                    <table
                        className='table'
                        data-testid='jobTable'
                    >
                        <thead>
                            <tr>
                                <th width='30px'/>
                                <th>
                                    <FormattedMessage
                                        id='admin.jobTable.headerStatus'
                                        defaultMessage='Status'
                                    />
                                </th>
                                {showFilesColumn &&
                                    <th>
                                        <FormattedMessage
                                            id='admin.jobTable.headerFiles'
                                            defaultMessage='Files'
                                        />
                                    </th>
                                }
                                <th>
                                    <FormattedMessage
                                        id='admin.jobTable.headerFinishAt'
                                        defaultMessage='Finish Time'
                                    />
                                </th>
                                <th>
                                    <FormattedMessage
                                        id='admin.jobTable.headerRunTime'
                                        defaultMessage='Run Time'
                                    />
                                </th>
                                <th colSpan='3'>
                                    <FormattedMessage
                                        id='admin.jobTable.headerExtraInfo'
                                        defaultMessage='Details'
                                    />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {items}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default JobTable;
