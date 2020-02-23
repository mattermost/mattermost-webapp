// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {ActionFunc, ActionResult} from 'mattermost-redux/types/actions';

import ComplianceReports from 'components/admin_console/compliance_reports';
import AuditTable from 'components/audit_table';
import LoadingScreen from 'components/loading_screen';

import ReloadIcon from 'components/widgets/icons/fa_reload_icon';
type Props = {
    isLicensed: boolean;
    audits: Array<any>;
    actions: {
        getAudits: () => Promise<{data: {
            id: string;
            create_at: number;
            user_id: string;
            action: string;
            extra_info: string;
            ip_address: string;
            session_id: string;
        };
        }>;
    };
};

type State = {
    loadingAudits: boolean;
};

export default class Audits extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            loadingAudits: true
        };
    }

    public componentDidMount() {
        this.props.actions.getAudits().then(
            () => this.setState({loadingAudits: false})
        );
    }

    private reload = () => {
        this.setState({loadingAudits: true});
        this.props.actions.getAudits().then(
            () => this.setState({loadingAudits: false})
        );
    };

    private activityLogHeader = () => {
        const h4Style = {
            display: 'inline-block',
            marginBottom: '6px'
        };
        const divStyle: object = {
            clear: 'both'
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
    };

    private renderComplianceReports = () => {
        if (!this.props.isLicensed) {
            return <div/>;
        }
        return <ComplianceReports/>;
    };

    public render() {
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
