// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {withRouter, RouteComponentProps} from 'react-router-dom';

import {Channel} from '@mattermost/types/channels';
import {Team, TeamMembership} from '@mattermost/types/teams';
import {UserProfile} from '@mattermost/types/users';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getUnreadScrollPositionPreference} from 'mattermost-redux/selectors/entities/preferences';
import {getUser} from 'mattermost-redux/selectors/entities/users';
import {getTeamByName, getTeamMemberships} from 'mattermost-redux/selectors/entities/teams';

import {Constants} from 'utils/constants';

import {GlobalState} from 'types/store';

import PostView from './post_view';

export const isChannelLoading = (params: RouteViewParams, channel?: Channel, team?: Team, teammate?: UserProfile, teamMemberships?: Record<string, TeamMembership>) => {
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

interface RouteViewParams {
    team?: string;
    identifier?: string;
    postid?: string;
}

type Props = {channelId: string} & RouteComponentProps<RouteViewParams>

function makeMapStateToProps() {
    return function mapStateToProps(state: GlobalState, ownProps: Props) {
        const params = ownProps.match?.params;
        const team = getTeamByName(state, params?.team || '');
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
        const channelLoading = isChannelLoading(params!, channel, team, teammate, teamMemberships);
        const unreadScrollPosition = getUnreadScrollPositionPreference(state);
        return {
            unreadScrollPosition,
            lastViewedAt,
            channelLoading,
        };
    };
}

export default withRouter(connect(makeMapStateToProps)(PostView));
