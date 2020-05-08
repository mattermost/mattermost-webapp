// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getLicenseConfig} from 'mattermost-redux/actions/general';
import {uploadLicense, removeLicense} from 'mattermost-redux/actions/admin';

import {upgradeToE0Status, upgradeToE0, restartServer} from 'actions/admin_actions';

import LicenseSettings from './license_settings.jsx';

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getLicenseConfig,
            uploadLicense,
            removeLicense,
            upgradeToE0,
            upgradeToE0Status,
            restartServer,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(LicenseSettings);
