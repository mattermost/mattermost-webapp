// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedDate, FormattedMessage, FormattedTime, injectIntl, intlShape} from 'react-intl';

import {cancelJob, createJob} from 'actions/job_actions.jsx';
import ErrorStore from 'stores/error_store.jsx';
import {JobStatuses} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

class JobTable extends React.PureComponent {
    static propTypes = {

        /**
         * Used for formatting dates
         */
        intl: intlShape.isRequired,

        /**
         * Array of jobs
         */
        jobs: PropTypes.arrayOf(PropTypes.object).isRequired,

        actions: PropTypes.shape({

            /**
             * Function to fetch jobs
             */
            getJobsByType: PropTypes.func.isRequired,
        }).isRequired,

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
    };

    constructor(props) {
        super(props);
        this.interval = null;

        this.state = {
            loading: true,
        };
    }

    UNSAFE_componentWillMount() { // eslint-disable-line camelcase
        this.interval = setInterval(this.reload, 15000);
    }

    componentDidMount() {
        this.props.actions.getJobsByType(this.props.jobType).then(
            () => this.setState({loading: false})
        );
    }

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    getStatus = (job) => {
        if (job.status === JobStatuses.PENDING) {
            return (
                <span
                    className='status-icon-warning'
                    title={Utils.localizeMessage('admin.jobTable.jobId', 'Job ID: ') + job.id}
                >
                    <FormattedMessage
                        id='admin.jobTable.statusPending'
                        defaultMessage='Pending'
                    />
                </span>
            );
        } else if (job.status === JobStatuses.IN_PROGRESS) {
            return (
                <span
                    className='status-icon-warning'
                    title={Utils.localizeMessage('admin.jobTable.jobId', 'Job ID: ') + job.id}
                >
                    <FormattedMessage
                        id='admin.jobTable.statusInProgress'
                        defaultMessage='In Progress'
                    />
                </span>
            );
        } else if (job.status === JobStatuses.SUCCESS) {
            return (
                <span
                    className='status-icon-success'
                    title={Utils.localizeMessage('admin.jobTable.jobId', 'Job ID: ') + job.id}
                >
                    <FormattedMessage
                        id='admin.jobTable.statusSuccess'
                        defaultMessage='Success'
                    />
                </span>
            );
        } else if (job.status === JobStatuses.ERROR) {
            return (
                <span
                    className='status-icon-error'
                    title={Utils.localizeMessage('admin.jobTable.jobId', 'Job ID: ') + job.id}
                >
                    <FormattedMessage
                        id='admin.jobTable.statusError'
                        defaultMessage='Error'
                    />
                </span>
            );
        } else if (job.status === JobStatuses.CANCEL_REQUESTED) {
            return (
                <span
                    className='status-icon-warning'
                    title={Utils.localizeMessage('admin.jobTable.jobId', 'Job ID: ') + job.id}
                >
                    <FormattedMessage
                        id='admin.jobTable.statusCanceling'
                        defaultMessage='Canceling...'
                    />
                </span>
            );
        } else if (job.status === JobStatuses.CANCELED) {
            return (
                <span
                    className='status-icon-error'
                    title={Utils.localizeMessage('admin.jobTable.jobId', 'Job ID: ') + job.id}
                >
                    <FormattedMessage
                        id='admin.jobTable.statusCanceled'
                        defaultMessage='Canceled'
                    />
                </span>
            );
        }

        return (
            <span title={Utils.localizeMessage('admin.jobTable.jobId', 'Job ID: ') + job.id}>{job.status}</span>
        );
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

    getRunLength = (job) => {
        let millis = job.last_activity_at - job.start_at;
        if (job.status === JobStatuses.IN_PROGRESS) {
            const runningMillis = Date.now() - job.start_at;
            if (runningMillis > millis) {
                millis = runningMillis;
            }
        }

        let lastActivity = Utils.localizeMessage('admin.jobTable.lastActivityAt', 'Last Activity: ') + '--';

        if (job.last_activity_at > 0) {
            lastActivity = Utils.localizeMessage('admin.jobTable.lastActivityAt', 'Last Activity: ') +
                this.props.intl.formatDate(new Date(job.last_activity_at), {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                }) + ' - ' +
                this.props.intl.formatTime(new Date(job.last_activity_at), {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                });
        }

        var seconds = Math.round(millis / 1000);
        var minutes = Math.round(millis / (1000 * 60));

        if (millis <= 0 || job.status === JobStatuses.CANCELED) {
            return (
                <span className='whitespace--nowrap'>{'--'}</span>
            );
        }

        if (seconds <= 120) {
            return (
                <span
                    className='whitespace--nowrap'
                    title={lastActivity}
                >
                    {seconds + Utils.localizeMessage('admin.jobTable.runLengthSeconds', ' seconds')}
                </span>
            );
        }

        return (
            <span
                className='whitespace--nowrap'
                title={lastActivity}
            >
                {minutes + Utils.localizeMessage('admin.jobTable.runLengthMinutes', ' minutes')}
            </span>
        );
    }

    getFinishAt = (status, millis) => {
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
    }

    reload = () => {
        this.setState({loading: true});

        this.props.actions.getJobsByType(this.props.jobType).then(
            () => {
                this.setState({
                    loading: false,
                });
            }
        );
    };

    handleCancelJob = (e) => {
        e.preventDefault();
        const jobId = e.currentTarget.getAttribute('data-job-id');

        cancelJob(
            jobId,
            () => {
                this.reload();
            },
            (err) => {
                ErrorStore.storeLastError(err);
                ErrorStore.emitChange();
                this.reload();
            }
        );
    };

    handleCreateJob = (e) => {
        e.preventDefault();

        const job = {
            type: this.props.jobType,
        };

        createJob(
            job,
            () => {
                this.reload();
            },
            (err) => {
                ErrorStore.storeLastError(err);
                ErrorStore.emitChange();
                this.reload();
            }
        );
    };

    getCancelButton = (job) => {
        let cancelButton = null;

        if (!this.props.disabled && (job.status === JobStatuses.PENDING || job.status === JobStatuses.IN_PROGRESS)) {
            cancelButton = (
                <span
                    data-job-id={job.id}
                    onClick={this.handleCancelJob}
                    className='job-table__cancel-button'
                    title={Utils.localizeMessage('admin.jobTable.cancelButton', 'Cancel')}
                >
                    {'×'}
                </span>
            );
        }

        return cancelButton;
    }

    render() {
        var items = this.props.jobs.map((job) => {
            return (
                <tr key={job.id}>
                    <td
                        width='30px'
                        className='whitespace--nowrap text-center'
                    >
                        {this.getCancelButton(job)}
                    </td>
                    <td className='whitespace--nowrap'>{this.getStatus(job)}</td>
                    <td className='whitespace--nowrap'>{this.getFinishAt(job.status, job.last_activity_at)}</td>
                    <td className='whitespace--nowrap'>{this.getRunLength(job)}</td>
                    <td
                        colSpan='3'
                        style={{whiteSpace: 'pre'}}
                    >{this.getExtraInfoText(job)}</td>
                </tr>
            );
        });

        return (
            <div className='job-table__panel'>
                <div className='job-table__create-button'>
                    <div>
                        <button
                            className='btn btn-default'
                            onClick={this.handleCreateJob}
                            disabled={this.props.disabled}
                        >
                            {this.props.createJobButtonText}
                        </button>
                    </div>
                    <div className='help-text'>
                        {this.props.createJobHelpText}
                    </div>
                </div>
                <div className='job-table__table'>
                    <table className='table'>
                        <thead>
                            <tr>
                                <th width='30px'/>
                                <th>
                                    <FormattedMessage
                                        id='admin.jobTable.headerStatus'
                                        defaultMessage='Status'
                                    />
                                </th>
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

export default injectIntl(JobTable);
