// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getUser} from 'mattermost-redux/selectors/entities/users';
import {getTeamByName} from 'mattermost-redux/selectors/entities/teams';

import {Constants} from 'utils/constants.jsx';

import PostView from './post_view.jsx';

const isChannelLoading = (params, channel, team, teammate) => {
    if (params.postid) {
        return false;
    }

    if (channel && team) {
        if (channel.type !== Constants.DM_CHANNEL && channel.name !== params.identifier) {
            return true;
        } else if (channel.type === Constants.DM_CHANNEL && teammate && params.identifier !== `@${teammate.username}`) {
            return true;
        }

        if (channel.team_id && channel.team_id !== team.id) {
            return true;
        }

        return false;
    }

    return true;
};

function makeMapStateToProps() {
    return function mapStateToProps(state, ownProps) {
        const team = getTeamByName(state, ownProps.match.params.team);
        let teammate;
        const channel = getChannel(state, ownProps.channelId);

        if (channel && channel.type === Constants.DM_CHANNEL && channel.teammate_id) {
            teammate = getUser(state, channel.teammate_id);
        }
        const channelLoading = isChannelLoading(ownProps.match.params, channel, team, teammate);
        const lastViewedAt = state.views.channel.lastChannelViewTime[ownProps.channelId];
        return {
            lastViewedAt,
            channelLoading,
            channel,
        };
    };
}

export default withRouter(connect(makeMapStateToProps)(PostView));
