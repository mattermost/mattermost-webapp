// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {Permissions} from 'mattermost-redux/constants';
import {haveISystemPermission} from 'mattermost-redux/selectors/entities/roles';
import {getConfig, getLicense, warnMetricsStatus as getWarnMetricsStatus} from 'mattermost-redux/selectors/entities/general';
import {getDisplayableErrors} from 'mattermost-redux/selectors/errors';
import {dismissError} from 'mattermost-redux/actions/errors';
import {getStandardAnalytics} from 'mattermost-redux/actions/admin';
import {GenericAction} from 'mattermost-redux/types/actions';

import {dismissNotice} from 'actions/views/notice';
import {GlobalState} from 'types/store';

import AnnouncementBarController from './announcement_bar_controller';

function mapStateToProps(state: GlobalState) {
    const canViewSystemErrors = haveISystemPermission(state, {permission: Permissions.MANAGE_SYSTEM});
    const license = getLicense(state);
    const config = getConfig(state);
    const errors = getDisplayableErrors(state);
    const warnMetricsStatus = getWarnMetricsStatus(state);

    let latestError = null;
    if (errors && errors.length >= 1) {
        latestError = errors[0];
    }

    return {
        license,
        config,
        canViewSystemErrors,
        latestError,
        warnMetricsStatus,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    const dismissFirstError = dismissError.bind(null, 0);
    return {
        actions: bindActionCreators({
            getStandardAnalytics,
            dismissError: dismissFirstError,
            dismissNotice,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AnnouncementBarController);
