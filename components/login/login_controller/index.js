// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

import LoginController from './login_controller.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const license = getLicense(state);

    const customBrand = license.CustomBrand === 'true';
    const isLicensed = license.IsLicensed === 'true';

    const customBrandText = config.CustomBrandText;
    const customDescriptionText = config.CustomDescriptionText;
    const enableCustomBrand = config.EnableCustomBrand === 'true';
    const enableLdap = config.EnableLdap === 'true';
    const enableOpenServer = config.EnableOpenServer === 'true';
    const enableSaml = config.EnableSaml === 'true';
    const enableSignInWithEmail = config.EnableSignInWithEmail === 'true';
    const enableSignInWithUsername = config.EnableSignInWithUsername === 'true';
    const enableSignUpWithEmail = config.EnableSignUpWithEmail === 'true';
    const enableSignUpWithGitLab = config.EnableSignUpWithGitLab === 'true';
    const enableSignUpWithGoogle = config.EnableSignUpWithGoogle === 'true';
    const enableSignUpWithOffice365 = config.EnableSignUpWithOffice365 === 'true';
    const experimentalPrimaryTeam = config.ExperimentalPrimaryTeam;
    const ldapLoginFieldName = config.LdapLoginFieldName;
    const samlLoginButtonText = config.SamlLoginButtonText;
    const siteName = config.SiteName;

    return {
        customBrand,
        isLicensed,
        customBrandText,
        customDescriptionText,
        enableCustomBrand,
        enableLdap,
        enableOpenServer,
        enableSaml,
        enableSignInWithEmail,
        enableSignInWithUsername,
        enableSignUpWithEmail,
        enableSignUpWithGitLab,
        enableSignUpWithGoogle,
        enableSignUpWithOffice365,
        experimentalPrimaryTeam,
        ldapLoginFieldName,
        samlLoginButtonText,
        siteName,
    };
}

export default connect(mapStateToProps)(LoginController);
