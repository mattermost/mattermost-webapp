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
import {getGlobalHeaderEnabled} from 'selectors/global_header';

import {openModal} from 'actions/views/modals';

import UserSettingsModal, {Props} from './user_settings_modal';

type OwnProps = {
    isContentChannelPreferences: boolean;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const config = getConfig(state);

    const closeUnusedDirectMessages = config.CloseUnusedDirectMessages === 'true';
    const experimentalChannelOrganization = config.ExperimentalChannelOrganization === 'true';
    const sendEmailNotifications = config.SendEmailNotifications === 'true';
    const requireEmailVerification = config.RequireEmailVerification === 'true';
    const collapsedThreads = isCollapsedThreadsEnabled(state);

    return {
        currentUser: getCurrentUser(state),
        closeUnusedDirectMessages,
        experimentalChannelOrganization,
        sendEmailNotifications,
        requireEmailVerification,
        collapsedThreads,
        globalHeaderEnabled: getGlobalHeaderEnabled(state),
        isContentChannelPreferences: ownProps.isContentChannelPreferences,
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
