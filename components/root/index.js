// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {shouldShowTermsOfService} from 'mattermost-redux/selectors/entities/users';

import {loadMeAndConfig, loadWarnMetricsStatus} from 'actions/views/root';

import Root from './root.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const showTermsOfService = shouldShowTermsOfService(state);
    const plugins = state.plugins.components.CustomRouteComponent;

    return {
        diagnosticsEnabled: config.DiagnosticsEnabled === 'true',
        noAccounts: config.NoAccounts === 'true',
        diagnosticId: config.DiagnosticId,
        showTermsOfService,
        plugins,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            loadMeAndConfig,
            loadWarnMetricsStatus,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Root);
