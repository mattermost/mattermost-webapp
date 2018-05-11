// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

import SignupLdap from './signup_ldap.jsx';

function mapStateToProps(state) {
    const license = getLicense(state);
    const config = getConfig(state);

    const isLicensed = license && license.IsLicensed === 'true';
    const ldapLoginFieldName = config.LdapLoginFieldName;
    const enableLdap = config.EnableLdap === 'true';
    const ldap = license.LDAP === 'true';
    const siteName = config.SiteName;
    const termsOfServiceLink = config.TermsOfServiceLink;
    const privacyPolicyLink = config.PrivacyPolicyLink;
    const customDescriptionText = config.CustomDescriptionText;

    return {
        isLicensed,
        ldapLoginFieldName,
        enableLdap,
        ldap,
        siteName,
        termsOfServiceLink,
        privacyPolicyLink,
        customDescriptionText,
    };
}

export default connect(mapStateToProps)(SignupLdap);
