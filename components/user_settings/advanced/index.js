// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import AdvancedSettingsDisplay from './user_settings_advanced.jsx';

function mapStateToProps(state, ownProps) {
    const config = state.entities.general.config;
    const license = state.entities.general.license;

    const enableWebrtc = config.EnableWebrtc === 'true';
    const enablePreviewFeatures = config.EnablePreviewFeatures === 'true';
    const buildEnterpriseReady = config.BuildEnterpriseReady === 'true';
    const isLicensed = license && license.IsLicensed === 'true';

    return {
        ...ownProps,
        enableWebrtc,
        enablePreviewFeatures,
        buildEnterpriseReady,
        isLicensed
    };
}

export default connect(mapStateToProps)(AdvancedSettingsDisplay);
