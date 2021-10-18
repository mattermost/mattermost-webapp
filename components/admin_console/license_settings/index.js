// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getLicenseConfig} from 'mattermost-redux/actions/general';
import {uploadLicense, removeLicense, getPrevTrialLicense} from 'mattermost-redux/actions/admin';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {requestTrialLicense, upgradeToE0Status, upgradeToE0, restartServer, ping} from 'actions/admin_actions';

import LicenseSettings from './license_settings.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    return {
        stats: state.entities.admin.analytics,
        upgradedFromTE: config.UpgradedFromTE === 'true',
        prevTrialLicense: state.entities.admin.prevTrialLicense,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getLicenseConfig,
            uploadLicense,
            removeLicense,
            getPrevTrialLicense,
            upgradeToE0,
            upgradeToE0Status,
            restartServer,
            ping,
            requestTrialLicense,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LicenseSettings);
