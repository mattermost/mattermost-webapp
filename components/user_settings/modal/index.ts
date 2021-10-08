// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {sendVerificationEmail} from 'mattermost-redux/actions/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {isCollapsedThreadsEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {GlobalState} from 'types/store';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';

import {openModal} from 'actions/views/modals';

import UserSettingsModal, {Props} from './user_settings_modal';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);

    const sendEmailNotifications = config.SendEmailNotifications === 'true';
    const requireEmailVerification = config.RequireEmailVerification === 'true';
    const collapsedThreads = isCollapsedThreadsEnabled(state);

    return {
        currentUser: getCurrentUser(state),
        sendEmailNotifications,
        requireEmailVerification,
        collapsedThreads,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Props['actions']>({
            sendVerificationEmail,
            openModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettingsModal);
