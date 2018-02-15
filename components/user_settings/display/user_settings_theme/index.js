// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import UserSettingsTheme from './user_settings_theme.jsx';

function mapStateToProps(state, ownProps) {
    const license = state.entities.general.license;

    const isLicensed = license.IsLicensed === 'true';
    const ldap = license.LDAP === 'true';

    return {
        ...ownProps,
        isLicensed,
        ldap
    };
}

export default connect(mapStateToProps)(UserSettingsTheme);
