// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import UserSettingsModal from './user_settings_modal.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    const closeUnusedDirectMessages = config.CloseUnusedDirectMessages === 'true';
    const experimentalSidebarPreference = config.ExperimentalSidebarPreference === 'true';

    return {
        closeUnusedDirectMessages,
        experimentalSidebarPreference,
    };
}

export default connect(mapStateToProps)(UserSettingsModal);
