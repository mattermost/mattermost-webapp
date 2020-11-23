// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Client4} from 'mattermost-redux/client';
import {FormattedDate, FormattedMessage, FormattedTime, injectIntl} from 'react-intl';

import {JobStatuses, exportFormats, JobTypes} from 'utils/constants';
import {intlShape} from 'utils/react_intl';
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
    };

    constructor(props) {
        super(props);
        this.interval = null;

        this.state = {
            loading: true,
        };
    }

    componentDidMount() {
        this.props.actions.getJobsByType(this.props.jobType).then(
            () => this.setState({loading: false}),
        );

        this.interval = setInterval(this.reload, 15000);
    }

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    getDownloadLink = (job) => {
        if (job.data?.is_downloadable === 'true' && parseInt(job.data?.messages_exported, 10) > 0 && job.data?.export_type !== exportFormats.EXPORT_FORMAT_GLOBALRELAY) { // eslint-disable-line camelcase
            return (
                <a
                    key={job.id}
                    href={`${Client4.getJobsRoute()}/${job.id}/download`}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    <FormattedMessage
                        id='admin.jobTable.downloadLink'
                        defaultMessage='Download'
                    />
                </a>
            );
        }

        return '--';
    }

    getStatus = (job) => {
        const formatMessage = this.props.intl.formatMessage;
        if (job.status === JobStatuses.PENDING) {
            return (
                <span
                    className='status-icon-warning'
                    title={formatMessage({id: 'admin.jobTable.jobId', defaultMessage: 'Job ID: '}) + job.id}
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
                    title={formatMessage({id: 'admin.jobTable.jobId', defaultMessage: 'Job ID: '}) + job.id}
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
                    title={formatMessage({id: 'admin.jobTable.jobId', defaultMessage: 'Job ID: '}) + job.id}
                >
                    <FormattedMessage
                        id='admin.jobTable.statusSuccess'
                        defaultMessage='Success'
                    />
                </span>
            );
        } else if (job.status === JobStatuses.WARNING) {
            return (
                <span
                    className='status-icon-warning'
                    title={formatMessage({id: 'admin.jobTable.jobId', defaultMessage: 'Job ID: '}) + job.id}
                >
                    <FormattedMessage
                        id='admin.jobTable.statusWarning'
                        defaultMessage='Warning'
                    />
                </span>
            );
        } else if (job.status === JobStatuses.ERROR) {
            return (
                <span
                    className='status-icon-error'
                    title={formatMessage({id: 'admin.jobTable.jobId', defaultMessage: 'Job ID: '}) + job.id}
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
                    title={formatMessage({id: 'admin.jobTable.jobId', defaultMessage: 'Job ID: '}) + job.id}
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
                    title={formatMessage({id: 'admin.jobTable.jobId', defaultMessage: 'Job ID: '}) + job.id}
                >
                    <FormattedMessage
                        id='admin.jobTable.statusCanceled'
                        defaultMessage='Canceled'
                    />
                </span>
            );
        }

        return (
            <span title={formatMessage({id: 'admin.jobTable.jobId', defaultMessage: 'Job ID: '}) + job.id}>{job.status}</span>
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
            },
        );
    };

    handleCancelJob = async (e) => {
        e.preventDefault();
        const jobId = e.currentTarget.getAttribute('data-job-id');
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

    getCancelButton = (job) => {
        const formatMessage = this.props.intl.formatMessage;
        let cancelButton = null;

        if (!this.props.disabled && (job.status === JobStatuses.PENDING || job.status === JobStatuses.IN_PROGRESS)) {
            cancelButton = (
                <span
                    data-job-id={job.id}
                    onClick={this.handleCancelJob}
                    className='job-table__cancel-button'
                    title={formatMessage({id: 'admin.jobTable.cancelButton', defaultMessage: 'Cancel'})}
                >
                    {'×'}
                </span>
            );
        }

        return cancelButton;
    }

    render() {
        const showFilesColumn = this.props.jobType === JobTypes.MESSAGE_EXPORT && this.props.downloadExportResults;
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
                    {showFilesColumn &&
                        <td className='whitespace--nowrap'>{this.getDownloadLink(job)}</td>
                    }
                    <td className='whitespace--nowrap'>{this.getFinishAt(job.status, job.last_activity_at)}</td>
                    <td className='whitespace--nowrap'>{this.getRunLength(job)}</td>
                    <td>{this.getExtraInfoText(job)}</td>
                </tr>
            );
        });

        return (
            <div className='job-table__panel'>
                <div className='job-table__create-button'>
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

export default injectIntl(JobTable);
