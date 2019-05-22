// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {getSendOnCtrlEnterPreferences} from 'selectors/preferences';

import NewChannelModal from './new_channel_modal.jsx';

function mapStateToProps(state) {
    return {
        ctrlSend: getSendOnCtrlEnterPreferences(state),
        currentTeamId: getCurrentTeamId(state),
    };
}

export default connect(mapStateToProps)(NewChannelModal);
