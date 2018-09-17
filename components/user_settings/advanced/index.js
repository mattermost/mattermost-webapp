// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import AdvancedSettingsDisplay from './user_settings_advanced.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    const enablePreviewFeatures = config.EnablePreviewFeatures === 'true';
    const enableUserDeactivation = config.EnableUserDeactivation === 'true';

    return {
        enablePreviewFeatures,
        enableUserDeactivation,
    };
}

export default connect(mapStateToProps)(AdvancedSettingsDisplay);
