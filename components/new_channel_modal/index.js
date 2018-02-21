// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {Preferences} from 'mattermost-redux/constants';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {isCurrentUserCurrentTeamAdmin} from 'mattermost-redux/selectors/entities/teams';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import {showCreateOption} from 'utils/channel_utils.jsx';
import {Constants} from 'utils/constants.jsx';

import NewChannelModal from './new_channel_modal.jsx';

function mapStateToProps(state) {
    const isSystemAdmin = isCurrentUserSystemAdmin(state);
    const isTeamAdmin = isCurrentUserCurrentTeamAdmin(state);
    const showCreatePublicChannelOption = showCreateOption(state, Constants.OPEN_CHANNEL, isTeamAdmin, isSystemAdmin);
    const showCreatePrivateChannelOption = showCreateOption(state, Constants.PRIVATE_CHANNEL, isTeamAdmin, isSystemAdmin);

    return {
        ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
        showCreatePublicChannelOption,
        showCreatePrivateChannelOption,
    };
}

export default connect(mapStateToProps)(NewChannelModal);
