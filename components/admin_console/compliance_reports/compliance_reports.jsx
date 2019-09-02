// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedDate, FormattedMessage, FormattedTime} from 'react-intl';
import {Client4} from 'mattermost-redux/client';

import LoadingScreen from 'components/loading_screen.jsx';
import ReloadIcon from 'components/widgets/icons/fa_reload_icon';
import LocalizedInput from 'components/localized_input/localized_input';
import {t} from 'utils/i18n.jsx';

export default class ComplianceReports extends React.PureComponent {
    static propTypes = {

        /*
         * Set if compliance reports are licensed
         */
        isLicensed: PropTypes.bool.isRequired,

        /*
         * Set if compliance reports are enabled in the config
         */
        enabled: PropTypes.bool.isRequired,

        /*
         * Array of reports to render
         */
        reports: PropTypes.arrayOf(PropTypes.object).isRequired,
        users: PropTypes.object.isRequired,

        /*
         * Error message to display
         */
        serverError: PropTypes.string,

        actions: PropTypes.shape({

            /*
             * Function to get compliance reports
             */
            getComplianceReports: PropTypes.func.isRequired,

            /*
             * Function to save compliance reports
             */
            createComplianceReport: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            loadingReports: true,
        };
    }

    componentDidMount() {
        if (!this.props.isLicensed || !this.props.enabled) {
            return;
        }

        this.props.actions.getComplianceReports().then(
            () => this.setState({loadingReports: false})
        );
    }

    reload = () => {
        this.setState({loadingReports: true});

        this.props.actions.getComplianceReports().then(
            () => this.setState({loadingReports: false})
        );
    }

    runReport = (e) => {
        e.preventDefault();

        this.setState({runningReport: true});

        const job = {};
        job.desc = this.refs.desc.value;
        job.emails = this.refs.emails.value;
        job.keywords = this.refs.keywords.value;
        job.start_at = Date.parse(this.refs.from.value);
        job.end_at = Date.parse(this.refs.to.value);

        this.props.actions.createComplianceReport(job).then(
            ({data}) => {
                if (data) {
                    this.refs.emails.value = '';
                    this.refs.keywords.value = '';
                    this.refs.desc.value = '';
                    this.refs.from.value = '';
                    this.refs.to.value = '';
                }
                this.setState({runningReport: false});
            }
        );
    }

    getDateTime(millis) {
        const date = new Date(millis);
        return (
            <span style={style.date}>
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

    render() {
        if (!this.props.isLicensed || !this.props.enabled) {
            return <div/>;
        }

        let content = null;
        if (this.state.loadingReports) {
            content = <LoadingScreen/>;
        } else {
            var list = [];

            for (var i = 0; i < this.props.reports.length; i++) {
                const report = this.props.reports[i];

                let params = '';
                if (report.type === 'adhoc') {
                    params = (
                        <span>
                            <FormattedMessage
                                id='admin.compliance_reports.from'
                                defaultMessage='From:'
                            />{' '}{this.getDateTime(report.start_at)}
                            <br/>
                            <FormattedMessage
                                id='admin.compliance_reports.to'
                                defaultMessage='To:'
                            />{' '}{this.getDateTime(report.end_at)}
                            <br/>
                            <FormattedMessage
                                id='admin.compliance_reports.emails'
                                defaultMessage='Emails:'
                            />{' '}{report.emails}
                            <br/>
                            <FormattedMessage
                                id='admin.compliance_reports.keywords'
                                defaultMessage='Keywords:'
                            />{' '}{report.keywords}
                        </span>);
                }

                let download = '';
                let status = '';
                if (report.status === 'finished') {
                    download = (
                        <a href={`${Client4.getBaseRoute()}/compliance/reports/${report.id}/download`}>
                            <FormattedMessage
                                id='admin.compliance_table.download'
                                defaultMessage='Download'
                            />
                        </a>
                    );

                    status = (
                        <span style={style.greenStatus}>{report.status}</span>
                    );
                } else if (report.status === 'failed') {
                    status = (
                        <span style={style.redStatus}>{report.status}</span>
                    );
                }

                let user = report.user_id;
                const profile = this.props.users[report.user_id];
                if (profile) {
                    user = profile.email;
                }

                list[i] = (
                    <tr key={report.id}>
                        <td style={style.dataCell}>{download}</td>
                        <td>{this.getDateTime(report.create_at)}</td>
                        <td>{status}</td>
                        <td>{report.count}</td>
                        <td>{report.type}</td>
                        <td style={style.dataCell}>{report.desc}</td>
                        <td>{user}</td>
                        <td style={style.dataCell}>{params}</td>
                    </tr>
                );
            }

            content = (
                <div style={style.content}>
                    <table className='table'>
                        <thead>
                            <tr>
                                <th/>
                                <th>
                                    <FormattedMessage
                                        id='admin.compliance_table.timestamp'
                                        defaultMessage='Timestamp'
                                    />
                                </th>
                                <th>
                                    <FormattedMessage
                                        id='admin.compliance_table.status'
                                        defaultMessage='Status'
                                    />
                                </th>
                                <th>
                                    <FormattedMessage
                                        id='admin.compliance_table.records'
                                        defaultMessage='Records'
                                    />
                                </th>
                                <th>
                                    <FormattedMessage
                                        id='admin.compliance_table.type'
                                        defaultMessage='Type'
                                    />
                                </th>
                                <th>
                                    <FormattedMessage
                                        id='admin.compliance_table.desc'
                                        defaultMessage='Description'
                                    />
                                </th>
                                <th>
                                    <FormattedMessage
                                        id='admin.compliance_table.userId'
                                        defaultMessage='Requested By'
                                    />
                                </th>
                                <th>
                                    <FormattedMessage
                                        id='admin.compliance_table.params'
                                        defaultMessage='Params'
                                    />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {list}
                        </tbody>
                    </table>
                </div>
            );
        }

        let serverError = '';
        if (this.props.serverError) {
            serverError = (
                <div
                    className='form-group has-error'
                    style={style.serverError}
                >
                    <label className='control-label'>{this.props.serverError}</label>
                </div>
            );
        }

        return (
            <div className='panel compliance-panel'>
                <h4>
                    <FormattedMessage
                        id='admin.compliance_reports.title'
                        defaultMessage='Compliance Reports'
                    />
                </h4>
                <div className='row'>
                    <div className='col-sm-6 col-md-4 form-group'>
                        <label>
                            <FormattedMessage
                                id='admin.compliance_reports.desc'
                                defaultMessage='Job Name:'
                            />
                        </label>
                        <LocalizedInput
                            type='text'
                            className='form-control'
                            id='desc'
                            ref='desc'
                            placeholder={{id: t('admin.compliance_reports.desc_placeholder'), defaultMessage: 'E.g. "Audit 445 for HR"'}}
                        />
                    </div>
                    <div className='col-sm-3 col-md-2 form-group'>
                        <label>
                            <FormattedMessage
                                id='admin.compliance_reports.from'
                                defaultMessage='From:'
                            />
                        </label>
                        <LocalizedInput
                            type='text'
                            className='form-control'
                            id='from'
                            ref='from'
                            placeholder={{id: t('admin.compliance_reports.from_placeholder'), defaultMessage: 'E.g. "2016-03-11"'}}
                        />
                    </div>
                    <div className='col-sm-3 col-md-2 form-group'>
                        <label>
                            <FormattedMessage
                                id='admin.compliance_reports.to'
                                defaultMessage='To:'
                            />
                        </label>
                        <LocalizedInput
                            type='text'
                            className='form-control'
                            id='to'
                            ref='to'
                            placeholder={{id: t('admin.compliance_reports.to_placeholder'), defaultMessage: 'E.g. "2016-03-15"'}}
                        />
                    </div>
                </div>
                <div className='row'>
                    <div className='col-sm-6 col-md-4 form-group'>
                        <label>
                            <FormattedMessage
                                id='admin.compliance_reports.emails'
                                defaultMessage='Emails:'
                            />
                        </label>
                        <LocalizedInput
                            type='text'
                            className='form-control'
                            id='emails'
                            ref='emails'
                            placeholder={{id: t('admin.compliance_reports.emails_placeholder'), defaultMessage: 'E.g. "bill@example.com, bob@example.com"'}}
                        />
                    </div>
                    <div className='col-sm-6 col-md-4 form-group'>
                        <label>
                            <FormattedMessage
                                id='admin.compliance_reports.keywords'
                                defaultMessage='Keywords:'
                            />
                        </label>
                        <LocalizedInput
                            type='text'
                            className='form-control'
                            id='keywords'
                            ref='keywords'
                            placeholder={{id: t('admin.compliance_reports.keywords_placeholder'), defaultMessage: 'E.g. "shorting stock"'}}
                        />
                    </div>
                </div>
                <div className='clearfix'>
                    <button
                        id='run-button'
                        type='submit'
                        className='btn btn-primary'
                        onClick={this.runReport}
                    >
                        <FormattedMessage
                            id='admin.compliance_reports.run'
                            defaultMessage='Run Compliance Report'
                        />
                    </button>
                </div>
                {serverError}
                <div className='text-right'>
                    <button
                        type='submit'
                        className='btn btn-link'
                        disabled={this.state.runningReport}
                        onClick={this.reload}
                    >
                        <ReloadIcon/>
                        <FormattedMessage
                            id='admin.compliance_reports.reload'
                            defaultMessage='Reload Completed Compliance Reports'
                        />
                    </button>
                </div>
                <div className='compliance-panel__table'>
                    {content}
                </div>
            </div>
        );
    }
}

const style = {
    content: {margin: 10},
    greenStatus: {color: 'green'},
    redStatus: {color: 'red'},
    dataCell: {whiteSpace: 'nowrap'},
    date: {whiteSpace: 'nowrap'},
    serverError: {marginTop: '10px'},
};
