// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {withRouter} from 'react-router-dom';
import {createSelector} from 'reselect';
import deepEqual from 'fast-deep-equal';

import {loadProfilesForDirect} from 'mattermost-redux/actions/users';
import {fetchMyChannelsAndMembers, viewChannel} from 'mattermost-redux/actions/channels';
import {getMyTeamUnreads, getTeamByName, selectTeam} from 'mattermost-redux/actions/teams';
import {getGroupsForTeam, getAllGroupsAssociatedToChannelsInTeam, getGroupsByUserId} from 'mattermost-redux/actions/groups';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {getLicense, getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId, getMyTeams} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {Action} from 'mattermost-redux/types/actions';
import {Dictionary} from 'mattermost-redux/types/utilities';

import {GlobalState} from 'types/store';

import {setPreviousTeamId} from 'actions/local_storage';
import {getPreviousTeamId} from 'selectors/local_storage';
import {loadStatusesForChannelAndSidebar} from 'actions/status_actions';
import {addUserToTeam} from 'actions/team_actions';
import {markChannelAsReadOnFocus} from 'actions/views/channel';
import {checkIfMFARequired} from 'utils/route';

import NeedsTeam from './needs_team';

type OwnProps = {
    match: {
        url: string;
    };
}

let prevTeamNamesIdMap: Dictionary<string> = {};

const getTeamNamesIdMap = createSelector(
    getMyTeams,
    (teams) => {
        const teamNamesIdMap: Dictionary<string> = {};
        teams.forEach((team) => teamNamesIdMap[team.name] = team.id);
        if (deepEqual(teamNamesIdMap, prevTeamNamesIdMap)) {
            return prevTeamNamesIdMap;
        }
        prevTeamNamesIdMap = teamNamesIdMap;
        return teamNamesIdMap;
    }
);

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const license = getLicense(state);
    const config = getConfig(state);
    const currentUser = getCurrentUser(state);
    const plugins = state.plugins.components.NeedsTeamComponent;

    return {
        license,
        theme: getTheme(state),
        mfaRequired: checkIfMFARequired(currentUser, license, config, ownProps.match.url),
        currentUser,
        currentTeamId: getCurrentTeamId(state),
        previousTeamId: getPreviousTeamId(state) as string,
        teamNamesIdMap: getTeamNamesIdMap(state),
        currentChannelId: getCurrentChannelId(state),
        useLegacyLHS: config.EnableLegacySidebar === 'true',
        plugins,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<Action>, any>({
            fetchMyChannelsAndMembers,
            getMyTeamUnreads,
            viewChannel,
            markChannelAsReadOnFocus,
            getTeamByName,
            addUserToTeam,
            setPreviousTeamId,
            selectTeam,
            loadStatusesForChannelAndSidebar,
            loadProfilesForDirect,
            getAllGroupsAssociatedToChannelsInTeam,
            getGroupsByUserId,
            getGroupsForTeam,
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NeedsTeam));
