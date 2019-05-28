// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import ComplianceReports from 'components/admin_console/compliance_reports';
import AuditTable from 'components/audit_table';
import LoadingScreen from 'components/loading_screen.jsx';

import AdminHeader from 'components/widgets/admin_console/admin_header.jsx';
import ReloadIcon from 'components/icon/reload_icon';

export default class Audits extends React.PureComponent {
    static propTypes = {
        isLicensed: PropTypes.bool.isRequired,
        customWrapperClass: PropTypes.string,

        /*
         * Array of audits to render
         */
        audits: PropTypes.arrayOf(PropTypes.object).isRequired,

        actions: PropTypes.shape({

            /*
             * Function to fetch audits
             */
            getAudits: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            loadingAudits: true,
        };

        this.props.customWrapperClass('compliance-not-licensed');
    }

    componentDidMount() {
        this.props.actions.getAudits().then(
            () => this.setState({loadingAudits: false})
        );
    }

    reload = () => {
        this.setState({loadingAudits: true});
        this.props.actions.getAudits().then(
            () => this.setState({loadingAudits: false})
        );
    }

    activityLogHeader = () => {
        const style = {
            display: 'inline-block',
            margin: 0,
        };
        return (
            <h4 style={style}>
                <FormattedMessage
                    id='admin.complianceMonitoring.userActivityLogsTitle'
                    defaultMessage='User Activity Logs'
                />
            </h4>
        );
    }

    renderComplianceReports = () => {
        if (!this.props.isLicensed) {
            return <div/>;
        }
        return (
            <ComplianceReports/>
        );
    }

    render() {
        let content = null;

        if (this.state.loadingAudits) {
            content = <LoadingScreen/>;
        } else {
            content = (
                <div>
                    <AuditTable
                        audits={this.props.audits}
                        showUserId={true}
                        showIp={true}
                        showSession={true}
                    />
                </div>
            );
        }

        return (
            <div className='wrapper--admin'>
                {this.renderComplianceReports()}
                <div className='panel audit-panel'>
                    <AdminHeader>
                        <FormattedMessage
                            id='admin.complianceMonitoring.title'
                            defaultMessage='Compliance Monitoring'
                        />
                        {this.activityLogHeader()}
                        <button
                            type='submit'
                            className='btn btn-link pull-right'
                            onClick={this.reload}
                        >
                            <ReloadIcon/>
                            <FormattedMessage
                                id='admin.audits.reload'
                                defaultMessage='Reload User Activity Logs'
                            />
                        </button>
                    </AdminHeader>
                    <div className='admin-console__wrapper'>
                        <div className='admin-console__content'>
                            <div className='audit-panel__table'>
                                {content}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}