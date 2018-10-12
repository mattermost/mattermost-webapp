// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {shouldShowTermsOfService} from 'mattermost-redux/selectors/entities/users';

import {loadMeAndConfig} from 'actions/views/root';

import Root from './root.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const showTermsOfService = shouldShowTermsOfService(state);

    return {
        diagnosticsEnabled: config.DiagnosticsEnabled === 'true',
        noAccounts: config.NoAccounts === 'true',
        diagnosticId: config.DiagnosticId,
        showTermsOfService,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            loadMeAndConfig,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Root);
