// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import SignupController from './signup_controller.jsx';

function mapStateToProps(state, ownProps) {
    const license = state.entities.general.license;
    const config = state.entities.general.config;

    const isLicensed = license && license.IsLicensed === 'true';
    const enableOpenServer = config.EnableOpenServer === 'true';
    const noAccounts = config.NoAccounts === 'true';
    const enableSignUpWithEmail = config.EnableSignUpWithEmail === 'true';
    const enableSignUpWithGitLab = config.EnableSignUpWithGitLab === 'true';
    const enableSignUpWithGoogle = config.EnableSignUpWithGoogle === 'true';
    const enableSignUpWithOffice365 = config.EnableSignUpWithOffice365 === 'true';
    const enableLDAP = config.EnableLdap === 'true';
    const enableSAML = config.EnableSaml === 'true';
    const samlLoginButtonText = config.SamlLoginButtonText;
    const siteName = config.SiteName;

    return {
        ...ownProps,
        isLicensed,
        enableOpenServer,
        noAccounts,
        enableSignUpWithEmail,
        enableSignUpWithGitLab,
        enableSignUpWithGoogle,
        enableSignUpWithOffice365,
        enableLDAP,
        enableSAML,
        samlLoginButtonText,
        siteName
    };
}

export default connect(mapStateToProps)(SignupController);
