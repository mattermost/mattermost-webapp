// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getChannelsNameMapInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import Constants from 'utils/constants';

import InviteMemberModal from './invite_member_modal.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    const sendEmailNotifications = config.SendEmailNotifications === 'true';
    const enableUserCreation = config.EnableUserCreation === 'true';

    const defaultChannel = getChannelsNameMapInCurrentTeam(state)[Constants.DEFAULT_CHANNEL];
    const team = getCurrentTeam(state);

    return {
        sendEmailNotifications,
        enableUserCreation,
        currentUser: getCurrentUser(state),
        defaultChannelName: defaultChannel ? defaultChannel.display_name : '',
        teamType: team ? team.type : '',
    };
}

export default connect(mapStateToProps)(InviteMemberModal);
