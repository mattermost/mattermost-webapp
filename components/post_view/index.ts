// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getUser} from 'mattermost-redux/selectors/entities/users';
import {getTeamByName, getTeamMemberships} from 'mattermost-redux/selectors/entities/teams';
import {Channel} from 'mattermost-redux/types/channels';
import {Team, TeamMembership} from 'mattermost-redux/types/teams';
import {UserProfile} from 'mattermost-redux/types/users';

import {Constants} from 'utils/constants';

import {GlobalState} from 'types/store';

import PostView from './post_view.js';

type Params = {
    identifier: string;
    team: string;
    postid?: string;
    path: string;
}

export const isChannelLoading = (params: Params, channel: Channel, team: Team, teammate: UserProfile, teamMemberships?:TeamMembership) => {
    if (params.postid) {
        return false;
    }

    if (channel && team) {
        if (channel.type !== Constants.DM_CHANNEL && channel.name !== params.identifier) {
            return true;
        } else if (channel.type === Constants.DM_CHANNEL && teammate && params.identifier !== `@${teammate.username}`) {
            return true;
        }

        const teamId = team.id;
        if ((channel.team_id && channel.team_id !== teamId) || (teamMemberships && !teamMemberships[teamId])) {
            return true;
        }

        return false;
    }

    return true;
};

type Props = {
    lastViewedAt: number;
    channelLoading: boolean;
    channelId: string;
    focusedPostId: string;
    match: {
        params: {
            team: string;
        };
    };
}

type State ={
    unreadChunkTimeStamp: number;
    loaderForChangeOfPostsChunk: boolean;
    channelLoading: boolean;
}

function makeMapStateToProps() {
    return function mapStateToProps(state: GlobalState, ownProps: Props) {
        const team = getTeamByName(state, ownProps.match.params.team);
        let teammate;

        const channel = getChannel(state, ownProps.channelId);
        let lastViewedAt = state.views.channel.lastChannelViewTime[ownProps.channelId];
        if (channel) {
            if (channel.type === Constants.DM_CHANNEL && channel.teammate_id) {
                teammate = getUser(state, channel.teammate_id);
            }
            lastViewedAt = channel.last_post_at ? lastViewedAt : channel.last_post_at;
        }

        const teamMemberships = getTeamMemberships(state);
        const channelLoading = isChannelLoading(ownProps.match.params, channel, team, teammate, teamMemberships);
        return {
            lastViewedAt,
            channelLoading,
        };
    };
}

export default withRouter(connect(makeMapStateToProps)(PostView));
