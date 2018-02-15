// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import UserSettingsModal from './user_settings_modal.jsx';

function mapStateToProps(state, ownProps) {
    const config = state.entities.general.config;

    const closeUnusedDirectMessages = config.CloseUnusedDirectMessages === 'true';
    const experimentalGroupUnreadChannels = config.ExperimentalGroupUnreadChannels;

    return {
        ...ownProps,
        closeUnusedDirectMessages,
        experimentalGroupUnreadChannels
    };
}

export default connect(mapStateToProps)(UserSettingsModal);
