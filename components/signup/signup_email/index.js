// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

import {getPasswordConfig} from 'utils/utils.jsx';

import SignupEmail from './signup_email.jsx';

function mapStateToProps(state) {
    const license = getLicense(state);
    const config = getConfig(state);

    const isLicensed = license && license.IsLicensed === 'true';
    const enableSignUpWithEmail = config.EnableSignUpWithEmail === 'true';
    const siteName = config.SiteName;
    const termsOfServiceLink = config.TermsOfServiceLink;
    const privacyPolicyLink = config.PrivacyPolicyLink;
    const customBrand = license.CustomBrand === 'true';
    const enableCustomBrand = config.EnableCustomBrand === 'true';
    const customDescriptionText = config.CustomDescriptionText;

    return {
        isLicensed,
        enableSignUpWithEmail,
        siteName,
        termsOfServiceLink,
        privacyPolicyLink,
        customBrand,
        enableCustomBrand,
        customDescriptionText,
        passwordConfig: getPasswordConfig(license, config),
    };
}

export default connect(mapStateToProps)(SignupEmail);
