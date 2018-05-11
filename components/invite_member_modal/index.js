// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import InviteMemberModal from './invite_member_modal.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    const sendEmailNotifications = config.SendEmailNotifications === 'true';
    const enableUserCreation = config.EnableUserCreation === 'true';

    return {
        sendEmailNotifications,
        enableUserCreation,
    };
}

export default connect(mapStateToProps)(InviteMemberModal);
