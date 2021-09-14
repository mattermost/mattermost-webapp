// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getUser} from 'mattermost-redux/selectors/entities/users';
import {getUserIdFromChannelName} from 'mattermost-redux/utils/channel_utils';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {displayUsername} from 'mattermost-redux/utils/user_utils';
import {Constants} from 'utils/constants';

import DraftTitle from './draft_title';

function mapStateToProps(state, ownProps) {
    const {channel, userId} = ownProps;

    let channelName = channel.display_name;
    let teammateId;
    let teammate;

    if (channel.type === Constants.DM_CHANNEL) {
        teammateId = getUserIdFromChannelName(userId, channel.name);
        teammate = getUser(state, teammateId);
        channelName = displayUsername(teammate, getTeammateNameDisplaySetting(state));
    }

    return {
        channelName,
        teammateId,
        teammate,
    };
}
export default connect(mapStateToProps)(DraftTitle);
