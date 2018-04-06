// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';
import LoadingScreen from 'components/loading_screen.jsx';

import ReportItem from './report_item';

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

    render() {
        if (!this.props.isLicensed || !this.props.enabled) {
            return <div/>;
        }

        let content = null;
        if (this.state.loadingReports) {
            content = <LoadingScreen/>;
        } else {
            const list = [];

            for (var i = 0; i < this.props.reports.length; i++) {
                const report = this.props.reports[i];
                list.push(
                    <ReportItem
                        key={report.id}
                        report={report}
                    />
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
                <h3>
                    <FormattedMessage
                        id='admin.compliance_reports.title'
                        defaultMessage='Compliance Reports'
                    />
                </h3>
                <div className='row'>
                    <div className='col-sm-6 col-md-4 form-group'>
                        <label>
                            <FormattedMessage
                                id='admin.compliance_reports.desc'
                                defaultMessage='Job Name:'
                            />
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='desc'
                            ref='desc'
                            placeholder={Utils.localizeMessage('admin.compliance_reports.desc_placeholder', 'E.g. "Audit 445 for HR"')}
                        />
                    </div>
                    <div className='col-sm-3 col-md-2 form-group'>
                        <label>
                            <FormattedMessage
                                id='admin.compliance_reports.from'
                                defaultMessage='From:'
                            />
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='from'
                            ref='from'
                            placeholder={Utils.localizeMessage('admin.compliance_reports.from_placeholder', 'E.g. "2016-03-11"')}
                        />
                    </div>
                    <div className='col-sm-3 col-md-2 form-group'>
                        <label>
                            <FormattedMessage
                                id='admin.compliance_reports.to'
                                defaultMessage='To:'
                            />
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='to'
                            ref='to'
                            placeholder={Utils.localizeMessage('admin.compliance_reports.to_placeholder', 'E.g. "2016-03-15"')}
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
                        <input
                            type='text'
                            className='form-control'
                            id='emails'
                            ref='emails'
                            placeholder={Utils.localizeMessage('admin.compliance_reports.emails_placeholder', 'E.g. "bill@example.com, bob@example.com"')}
                        />
                    </div>
                    <div className='col-sm-6 col-md-4 form-group'>
                        <label>
                            <FormattedMessage
                                id='admin.compliance_reports.keywords'
                                defaultMessage='Keywords:'
                            />
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='keywords'
                            ref='keywords'
                            placeholder={Utils.localizeMessage('admin.compliance_reports.keywords_placeholder', 'E.g. "shorting stock"')}
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
                        <i className='fa fa-refresh'/>
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
