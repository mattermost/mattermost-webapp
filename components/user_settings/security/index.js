// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getMe} from 'mattermost-redux/actions/users';
import * as UserUtils from 'mattermost-redux/utils/user_utils';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';

import {deactivateMfa} from 'actions/views/mfa';

import {getPasswordConfig} from 'utils/utils.jsx';
import {Preferences} from 'utils/constants';

import SecurityTab from './user_settings_security.jsx';

function mapStateToProps(state, ownProps) {
    const license = getLicense(state);
    const config = getConfig(state);

    const tokensEnabled = config.EnableUserAccessTokens === 'true';
    const userHasTokenRole = UserUtils.hasUserAccessTokenRole(ownProps.user.roles) || UserUtils.isSystemAdmin(ownProps.user.roles);

    const isLicensed = license && license.IsLicensed === 'true';
    const mfaLicensed = license && license.MFA === 'true';

    const enableOAuthServiceProvider = config.EnableOAuthServiceProvider === 'true';
    const enableMultifactorAuthentication = config.EnableMultifactorAuthentication === 'true';
    const enforceMultifactorAuthentication = config.EnforceMultifactorAuthentication === 'true';
    const enableSignUpWithEmail = config.EnableSignUpWithEmail === 'true';
    const enableSignUpWithGitLab = config.EnableSignUpWithGitLab === 'true';
    const enableSignUpWithGoogle = config.EnableSignUpWithGoogle === 'true';
    const enableLdap = config.EnableLdap === 'true';
    const enableSaml = config.EnableSaml === 'true';
    const enableSignUpWithOffice365 = config.EnableSignUpWithOffice365 === 'true';
    const experimentalEnableAuthenticationTransfer = config.ExperimentalEnableAuthenticationTransfer === 'true';

    return {
        canUseAccessTokens: tokensEnabled && userHasTokenRole,
        isLicensed,
        mfaLicensed,
        enableOAuthServiceProvider,
        enableMultifactorAuthentication,
        enforceMultifactorAuthentication,
        enableSignUpWithEmail,
        enableSignUpWithGitLab,
        enableSignUpWithGoogle,
        enableLdap,
        enableSaml,
        enableSignUpWithOffice365,
        experimentalEnableAuthenticationTransfer,
        passwordConfig: getPasswordConfig(config),
        militaryTime: getBool(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.USE_MILITARY_TIME, false),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            deactivateMfa,
            getMe,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SecurityTab);
