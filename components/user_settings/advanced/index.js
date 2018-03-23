// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

import AdvancedSettingsDisplay from './user_settings_advanced.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const license = getLicense(state);

    const enableWebrtc = config.EnableWebrtc === 'true';
    const enablePreviewFeatures = config.EnablePreviewFeatures === 'true';
    const buildEnterpriseReady = config.BuildEnterpriseReady === 'true';
    const isLicensed = license && license.IsLicensed === 'true';

    return {
        enableWebrtc,
        enablePreviewFeatures,
        buildEnterpriseReady,
        isLicensed,
    };
}

export default connect(mapStateToProps)(AdvancedSettingsDisplay);
