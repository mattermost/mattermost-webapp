// Copyright (c) 2017 Mattermost Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getTeamByName} from 'mattermost-redux/selectors/entities/teams';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';

import Constants from 'utils/constants';
import {getGlobalItem} from 'selectors/storage';

import CenterChannel from './center_channel';

const getLastChannelPath = (state, teamName) => {
    let channelName = Constants.DEFAULT_CHANNEL;
    const team = getTeamByName(state, teamName);

    if (team) {
        const channelId = getGlobalItem(state, team.id, null);
        const channel = getChannel(state, channelId);
        if (channel) {
            channelName = channel.name;
        }
    }
    return channelName;
};

const mapStateToProps = (state, ownProps) => ({
    lastChannelPath: `${ownProps.match.url}/channels/${getLastChannelPath(state, ownProps.match.params.team)}`,
});

export default connect(mapStateToProps)(CenterChannel);
