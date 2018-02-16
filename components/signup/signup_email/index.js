// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import SignupEmail from './signup_email.jsx';

function mapStateToProps(state, ownProps) {
    const license = state.entities.general.license;
    const config = state.entities.general.config;

    const isLicensed = license && license.IsLicensed === 'true';
    const enableSignUpWithEmail = config.EnableSignUpWithEmail === 'true';
    const siteName = config.SiteName;
    const termsOfServiceLink = config.TermsOfServiceLink;
    const privacyPolicyLink = config.PrivacyPolicyLink;
    const customBrand = license.CustomBrand === 'true';
    const enableCustomBrand = config.EnableCustomBrand === 'true';
    const customDescriptionText = config.CustomDescriptionText;

    return {
        ...ownProps,
        isLicensed,
        enableSignUpWithEmail,
        siteName,
        termsOfServiceLink,
        privacyPolicyLink,
        customBrand,
        enableCustomBrand,
        customDescriptionText
    };
}

export default connect(mapStateToProps)(SignupEmail);
