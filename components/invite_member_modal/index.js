// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import InviteMemberModal from './invite_member_modal.jsx';

function mapStateToProps(state) {
    const config = state.entities.general.config;

    const sendEmailNotifications = config.SendEmailNotifications === 'true';
    const enableUserCreation = config.EnableUserCreation === 'true';

    return {
        sendEmailNotifications,
        enableUserCreation
    };
}

export default connect(mapStateToProps)(InviteMemberModal);
