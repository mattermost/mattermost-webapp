// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {Preferences} from 'mattermost-redux/constants';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {isCurrentUserCurrentTeamAdmin} from 'mattermost-redux/selectors/entities/teams';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import NewChannelModal from './new_channel_modal.jsx';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
        ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
        isTeamAdmin: isCurrentUserCurrentTeamAdmin(state),
        isSystemAdmin: isCurrentUserSystemAdmin(state)
    };
}

export default connect(mapStateToProps)(NewChannelModal);
