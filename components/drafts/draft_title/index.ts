// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getUser} from 'mattermost-redux/selectors/entities/users';
import {getUserIdFromChannelName} from 'mattermost-redux/utils/channel_utils';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {displayUsername} from 'mattermost-redux/utils/user_utils';
import {Constants} from 'utils/constants';

import {Channel} from 'mattermost-redux/types/channels';
import {GlobalState} from 'types/store';

import DraftTitle from './draft_title';

type OwnProps = {
    channel: Channel;
    userId: string;
};

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
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
        selfDraft: teammateId === userId,
    };
}
export default connect(mapStateToProps)(DraftTitle);
