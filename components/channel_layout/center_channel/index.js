// Copyright (c) 2017 Mattermost Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getTeamByName} from 'mattermost-redux/selectors/entities/teams';

import Constants from 'utils/constants';
import {getGlobalItem} from 'selectors/storage';

import CenterChannel from './center_channel';

const getLastChannelPath = (state, teamName) => {
    const team = getTeamByName(state, teamName);

    if (team) {
        return getGlobalItem(state, Constants.PREV_CHANNEL_KEY + team.id, Constants.DEFAULT_CHANNEL);
    }
    return Constants.DEFAULT_CHANNEL;
};

const mapStateToProps = (state, ownProps) => ({
    lastChannelPath: `${ownProps.match.url}/channels/${getLastChannelPath(state, ownProps.match.params.team)}`,
});

export default connect(mapStateToProps)(CenterChannel);
