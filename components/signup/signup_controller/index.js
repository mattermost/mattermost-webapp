// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

import SignupController from './signup_controller.jsx';

function mapStateToProps(state) {
    const license = getLicense(state);
    const config = getConfig(state);

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
        siteName,
    };
}

export default connect(mapStateToProps)(SignupController);
