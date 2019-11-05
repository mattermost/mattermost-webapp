// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

import {logUserOut} from 'actions/global_actions.jsx';

import MFAController from './mfa_controller.jsx';

function mapStateToProps(state) {
    const license = getLicense(state);
    const config = getConfig(state);

    const mfa = license.MFA === 'true';
    const enableMultifactorAuthentication = config.EnableMultifactorAuthentication === 'true';
    const enforceMultifactorAuthentication = config.EnforceMultifactorAuthentication === 'true';

    return {
        mfa,
        enableMultifactorAuthentication,
        enforceMultifactorAuthentication,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            logUserOut,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MFAController);
