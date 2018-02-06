// Copyright (c) 2017 Mattermost Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getTeamByName} from 'mattermost-redux/selectors/entities/teams';

// import {createSelector} from 'reselect';

import Constants from 'utils/constants';
import {getGlobalItem} from 'selectors/storage';

import CenterChannel from './center_channel';

function mapStateToProps(state, ownProps) {
    let channelName = Constants.DEFAULT_CHANNEL;
    const team = getTeamByName(state, ownProps.params.match.params.team);
    if (team) {
        const ChannelId = getGlobalItem(state, team.id, null);
        const channel = ChannelStore.getChannelById(channelId);
    }
    return {
        lastChannelPath: `${ownProps.params.match.url}/channels/${channelName}`
    };
}

export default connect(mapStateToProps)(CenterChannel);
