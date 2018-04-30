// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import ComplianceReports from 'components/admin_console/compliance_reports';
import AuditTable from 'components/audit_table.jsx';
import LoadingScreen from 'components/loading_screen.jsx';

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

    render() {
        let content = null;

        if (!this.props.isLicensed) {
            return <div/>;
        }

        if (this.state.loadingAudits) {
            content = <LoadingScreen/>;
        } else {
            content = (
                <div style={style.auditTable}>
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
                <ComplianceReports/>

                <div className='panel audit-panel'>
                    <h3 className='admin-console-header'>
                        <FormattedMessage
                            id='admin.audits.title'
                            defaultMessage='User Activity Logs'
                        />
                        <button
                            type='submit'
                            className='btn btn-link pull-right'
                            onClick={this.reload}
                        >
                            <i className='fa fa-refresh'/>
                            <FormattedMessage
                                id='admin.audits.reload'
                                defaultMessage='Reload User Activity Logs'
                            />
                        </button>
                    </h3>
                    <div className='audit-panel__table'>
                        {content}
                    </div>
                </div>
            </div>
        );
    }
}

const style = {
    auditTable: {margin: 10},
};
