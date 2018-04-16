// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {Preferences} from 'mattermost-redux/constants';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import NewChannelModal from './new_channel_modal.jsx';

function mapStateToProps(state) {
    return {
        ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
        currentTeamId: getCurrentTeamId(state),
    };
}

export default connect(mapStateToProps)(NewChannelModal);
