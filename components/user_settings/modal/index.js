// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {sendVerificationEmail} from 'mattermost-redux/actions/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import UserSettingsModal from './user_settings_modal.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    const closeUnusedDirectMessages = config.CloseUnusedDirectMessages === 'true';
    const experimentalGroupUnreadChannels = config.ExperimentalGroupUnreadChannels;
    const sendEmailNotifications = config.SendEmailNotifications === 'true';
    const requireEmailVerification = config.RequireEmailVerification === 'true';

    return {
        closeUnusedDirectMessages,
        experimentalGroupUnreadChannels,
        sendEmailNotifications,
        requireEmailVerification,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            sendVerificationEmail,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettingsModal);
