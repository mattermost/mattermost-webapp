// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {createSelector} from 'reselect';

import {createComplianceReport, getComplianceReports} from 'mattermost-redux/actions/admin';
import {getComplianceReports as selectComplianceReports, getConfig} from 'mattermost-redux/selectors/entities/admin';
import {getLicense} from 'mattermost-redux/selectors/entities/general';

import ComplianceReports from './compliance_reports.jsx';

const getUsersForReports = createSelector(
    (state) => state.entities.users.profiles,
    (state) => state.entities.admin.complianceReports,
    (users, reports) => {
        const usersMap = {};
        Object.values(reports).forEach((r) => {
            const u = users[r.user_id];
            if (u) {
                usersMap[u.id] = u;
            }
        });
        return usersMap;
    },
);

function mapStateToProps(state) {
    const license = getLicense(state);
    const isLicensed = license.IsLicensed === 'true';

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
        users: getUsersForReports(state),
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
