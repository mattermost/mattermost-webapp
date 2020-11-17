// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {sendVerificationEmail} from 'mattermost-redux/actions/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {GlobalState} from 'mattermost-redux/types/store';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';

import UserSettingsModal, {Props} from './user_settings_modal';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);

    const closeUnusedDirectMessages = config.CloseUnusedDirectMessages === 'true';
    const experimentalChannelOrganization = config.ExperimentalChannelOrganization === 'true';
    const sendEmailNotifications = config.SendEmailNotifications === 'true';
    const requireEmailVerification = config.RequireEmailVerification === 'true';

    return {
        currentUser: getCurrentUser(state),
        closeUnusedDirectMessages,
        experimentalChannelOrganization,
        sendEmailNotifications,
        requireEmailVerification,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Props['actions']>({
            sendVerificationEmail,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettingsModal);
