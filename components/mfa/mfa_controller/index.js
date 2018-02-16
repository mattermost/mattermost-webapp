// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import MFAController from './mfa_controller.jsx';

function mapStateToProps(state) {
    const license = state.entities.general.license;
    const config = state.entities.general.config;

    const mfa = license.MFA === 'true';
    const enableMultifactorAuthentication = config.EnableMultifactorAuthentication === 'true';
    const enforceMultifactorAuthentication = config.EnforceMultifactorAuthentication === 'true';

    return {
        mfa,
        enableMultifactorAuthentication,
        enforceMultifactorAuthentication
    };
}

export default connect(mapStateToProps)(MFAController);
