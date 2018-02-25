// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {createComplianceReport, getComplianceReports} from 'mattermost-redux/actions/admin';
import {getComplianceReports as selectComplianceReports, getConfig} from 'mattermost-redux/selectors/entities/admin';
import {getLicense} from 'mattermost-redux/selectors/entities/general';

import ComplianceReports from './compliance_reports.jsx';

function mapStateToProps(state) {
    const license = getLicense(state);
    const isLicensed = license.IsLicened === 'true';

    let enabled = false;
    const config = getConfig(state);
    if (config && config.ComplianceSettings) {
        enabled = config.ComplianceSettings.Enable;
    }

    let serverError;
    const error = state.requests.admin.createCompliance.error;
    if (error) {
        serverError = error.message;
    }

    const reports = Object.values(selectComplianceReports(state)).sort((a, b) => {
        return b.create_at - a.create_at;
    });

    return {
        isLicensed,
        enabled,
        reports,
        serverError,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getComplianceReports,
            createComplianceReport,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ComplianceReports);
