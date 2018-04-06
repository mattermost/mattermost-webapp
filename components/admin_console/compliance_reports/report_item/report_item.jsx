// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedDate, FormattedMessage, FormattedTime} from 'react-intl';
import {Client4} from 'mattermost-redux/client';

export default class ReportItem extends React.PureComponent {
    static propTypes = {
        email: PropTypes.string,
        report: PropTypes.object,
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
        if (!this.props.report) {
            return <div/>;
        }

        const report = this.props.report;

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

        return (
            <tr key={report.id}>
                <td style={style.dataCell}>{download}</td>
                <td>{this.getDateTime(report.create_at)}</td>
                <td>{status}</td>
                <td>{report.count}</td>
                <td>{report.type}</td>
                <td style={style.dataCell}>{report.desc}</td>
                <td>{this.props.email || report.user_id}</td>
                <td style={style.dataCell}>{params}</td>
            </tr>
        );
    }
}

const style = {
    greenStatus: {color: 'green'},
    redStatus: {color: 'red'},
    dataCell: {whiteSpace: 'nowrap'},
    date: {whiteSpace: 'nowrap'},
};
