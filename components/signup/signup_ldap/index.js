// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import SignupLdap from './signup_ldap.jsx';

function mapStateToProps(state, ownProps) {
    const license = state.entities.general.license;
    const config = state.entities.general.config;

    const isLicensed = license && license.IsLicensed === 'true';
    const ldapLoginFieldName = config.LdapLoginFieldName;
    const enableLdap = config.EnableLdap === 'true';
    const ldap = license.LDAP === 'true';
    const siteName = config.SiteName;
    const termsOfServiceLink = config.TermsOfServiceLink;
    const privacyPolicyLink = config.PrivacyPolicyLink;
    const customBrand = license.CustomBrand === 'true';
    const enableCustomBrand = config.EnableCustomBrand === 'true';
    const customDescriptionText = config.CustomDescriptionText;

    return {
        ...ownProps,
        isLicensed,
        ldapLoginFieldName,
        enableLdap,
        ldap,
        siteName,
        termsOfServiceLink,
        privacyPolicyLink,
        customBrand,
        enableCustomBrand,
        customDescriptionText
    };
}

export default connect(mapStateToProps)(SignupLdap);
