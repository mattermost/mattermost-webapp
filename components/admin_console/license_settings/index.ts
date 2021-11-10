// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getLicenseConfig} from 'mattermost-redux/actions/general';
import {GenericAction} from 'mattermost-redux/types/actions';
import {uploadLicense, removeLicense, getPrevTrialLicense} from 'mattermost-redux/actions/admin';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {GlobalState} from 'types/store';

import {requestTrialLicense, upgradeToE0Status, upgradeToE0, restartServer, ping} from 'actions/admin_actions';

import LicenseSettings from './license_settings.jsx';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    return {
        stats: state.entities.admin.analytics,
        upgradedFromTE: config.UpgradedFromTE === 'true',
        prevTrialLicense: state.entities.admin.prevTrialLicense,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
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
