// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import ComplianceReports from 'components/admin_console/compliance_reports';
import AuditTable from 'components/audit_table';
import LoadingScreen from 'components/loading_screen';

import ReloadIcon from 'components/widgets/icons/fa_reload_icon';

export default class Audits extends React.PureComponent {
    static propTypes = {
        isLicensed: PropTypes.bool.isRequired,

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
        const h4Style = {
            display: 'inline-block',
            marginBottom: '6px',
        };
        const divStyle = {
            clear: 'both',
        };
        return (
            <div style={divStyle}>
                <h4 style={h4Style}>
                    <FormattedMessage
                        id='admin.complianceMonitoring.userActivityLogsTitle'
                        defaultMessage='User Activity Logs'
                    />
                </h4>
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
            </div>
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
            <div>
                {this.renderComplianceReports()}
                <div className='panel compliance-panel'>
                    {this.activityLogHeader()}
                    <div className='compliance-panel__table'>
                        {content}
                    </div>
                </div>
            </div>
        );
    }
}
