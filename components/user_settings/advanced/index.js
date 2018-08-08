// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

import AdvancedSettingsDisplay from './user_settings_advanced.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const license = getLicense(state);

    const enablePreviewFeatures = config.EnablePreviewFeatures === 'true';
    const buildEnterpriseReady = config.BuildEnterpriseReady === 'true';
    const isLicensed = license && license.IsLicensed === 'true';

    return {
        enablePreviewFeatures,
        buildEnterpriseReady,
        isLicensed,
    };
}

export default connect(mapStateToProps)(AdvancedSettingsDisplay);
