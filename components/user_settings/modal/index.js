// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {sendVerificationEmail} from 'mattermost-redux/actions/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import UserSettingsModal from './user_settings_modal.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    const closeUnusedDirectMessages = config.CloseUnusedDirectMessages === 'true';
    const experimentalChannelOrganization = config.ExperimentalChannelOrganization === 'true';
    const sendEmailNotifications = config.SendEmailNotifications === 'true';
    const requireEmailVerification = config.RequireEmailVerification === 'true';
    const loginWithCertificate = config.LoginWithCertificate === 'true';                    //adding custom value from conf


    return {
        currentUser: getCurrentUser(state),
        closeUnusedDirectMessages,
        experimentalChannelOrganization,
        sendEmailNotifications,
        requireEmailVerification,
        loginWithCertificate,   //returning custom value
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
